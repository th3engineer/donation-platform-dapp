use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer as SplTransfer};

declare_id!("EsCGgqjt6ZEoVL2qn2L271VgJJqVU3KViWwtAUHUdRgL");

const MAX_SLUG_LENGTH: usize = 32;
const MAX_ID_LENGTH: usize = 32;

fn validate_slug(slug: &str) -> Result<()> {
    if !slug.is_ascii() {
        return err!(CustomError::SlugAsciiError);
    }

    if slug.len() > MAX_SLUG_LENGTH {
        return err!(CustomError::InvalidSlugLength);
    }

    Ok(())
}

fn validate_id(id: &str) -> Result<()> {
    if id.len() > MAX_ID_LENGTH {
        return err!(CustomError::InvalidIdLength);
    }

    Ok(())
}

#[program]
pub mod donation_dapp {
    use super::*;

    pub fn initialize(ctx: Context<InitializeAccounts>) -> Result<()> {
        let data = &mut ctx.accounts.data;
        let token_acc_pda = &ctx.accounts.token_acc_pda;
        let owner = &ctx.program_id;

        data.number_of_charities = 0;
        data.charity_pda = None;
        data.token_acc_pda = token_acc_pda.key();
        data.owner = owner.key();

        Ok(())
    }

    pub fn create_charity(ctx: Context<CreateCharityAccounts>, slug: String) -> Result<()> {
        validate_slug(&slug)?;

        let clock = Clock::get()?;
        let current_timestamp = clock.unix_timestamp;
        let charity_pda = &mut ctx.accounts.charity_pda;
        let last_charity_pda = &mut ctx.accounts.last_charity_pda;
        let recipient_wallet_pda = &mut ctx.accounts.recipient_wallet_pda;
        let data = &mut ctx.accounts.data;

        match last_charity_pda {
            Some(last_charity_pda) => {
                if last_charity_pda.next_charity_pda.is_some() {
                    return err!(CustomError::LastPdaError);
                }

                last_charity_pda.next_charity_pda = Some(charity_pda.key());
            }
            None => {
                data.charity_pda = Some(charity_pda.key());
            }
        }

        charity_pda.slug = slug;
        charity_pda.number_of_campaigns = 0;
        charity_pda.created_at = current_timestamp;
        charity_pda.recipient_wallet_pda = recipient_wallet_pda.key();
        charity_pda.campaign_pda = None;
        charity_pda.owner_pubkey = ctx.accounts.payer.key();
        data.number_of_charities += 1;

        Ok(())
    }

    pub fn create_campaign(
        ctx: Context<CreateCampaignAccounts>,
        new_id: String,
        deadline: i64,
        goal: u64,
    ) -> Result<()> {
        validate_id(&new_id.to_string())?;

        let clock = Clock::get()?;
        let current_timestamp = clock.unix_timestamp;
        let campaign_pda = &mut ctx.accounts.campaign_pda;
        let last_campaign_pda = &mut ctx.accounts.last_campaign_pda;
        let charity_pda = &mut ctx.accounts.charity_pda;

        match last_campaign_pda {
            Some(last_campaign_pda) => {
                if last_campaign_pda.next_campaign_pda.is_some() {
                    return err!(CustomError::LastPdaError);
                }

                last_campaign_pda.next_campaign_pda = Some(campaign_pda.key());
            }
            None => {
                charity_pda.campaign_pda = Some(charity_pda.key());
            }
        }

        charity_pda.number_of_campaigns += 1;

        campaign_pda.campaign_id = new_id;
        campaign_pda.number_of_donations = 0;
        campaign_pda.created_at = current_timestamp;
        campaign_pda.charity_pda = charity_pda.key();
        campaign_pda.donation_pda = None;
        campaign_pda.deadline = deadline;
        campaign_pda.goal = goal;
        campaign_pda.collected = 0;
        campaign_pda.refunded = 0;
        campaign_pda.is_cancelled = false;

        Ok(())
    }

    pub fn cancel_campaign(ctx: Context<CancelCampaignAccounts>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign_pda;
        let charity = &mut ctx.accounts.charity_pda;
        let clock = Clock::get()?;
        let current_timestamp = clock.unix_timestamp;

        let is_goal_reached = campaign.collected >= campaign.goal;
        let is_past_deadline = current_timestamp > campaign.deadline;

        if charity.key() != campaign.charity_pda {
            return err!(CustomError::OnlyCampaignOwnerCanCancel);
        }

        if is_goal_reached || is_past_deadline {
            return err!(CustomError::GoalReached);
        }

        if ctx.accounts.signer.key() != charity.owner_pubkey {
            return err!(CustomError::OnlyCampaignOwnerCanCancel);
        }

        campaign.is_cancelled = true;

        Ok(())
    }

    pub fn donate(ctx: Context<DonateAccounts>, new_id: String, amount: u64) -> Result<()> {
        let clock = Clock::get()?;
        let current_timestamp = clock.unix_timestamp;

        let from = &ctx.accounts.donor_wallet_pda;
        let to = &ctx.accounts.token_acc_pda;
        let token_program = &ctx.accounts.spl_token_program;
        let authority = &ctx.accounts.signer;
        let campaign = &mut ctx.accounts.campaign_pda;
        let donation = &mut ctx.accounts.donation;
        let last_donation = &mut ctx.accounts.last_donation;

        if authority.key() != from.owner.key() {
            return err!(CustomError::InvalidDonationOwner);
        }

        if ctx.program_id.key() != to.owner.key() {
            return err!(CustomError::InvalidDonationDestination);
        }

        if current_timestamp > campaign.deadline {
            return err!(CustomError::InvalidDeadline);
        }

        if campaign.is_cancelled {
            return err!(CustomError::CanNotDonateToCancelledCampaign);
        }

        if campaign.collected >= campaign.goal {
            return err!(CustomError::GoalReached);
        }

        // transfer to program wallet
        let cpi_accounts = SplTransfer {
            from: from.to_account_info().clone(),
            to: to.to_account_info().clone(),
            authority: authority.to_account_info().clone(),
        };

        let cpi_program = token_program.to_account_info();

        // Invoke SPL token transfer
        token::transfer(CpiContext::new(cpi_program, cpi_accounts), amount)?;

        campaign.collected += amount;

        if campaign.collected >= campaign.goal {
            let from = &ctx.accounts.token_acc_pda;
            let to: &Account<TokenAccount> = &ctx.accounts.recipient_wallet_pda;
            let token_program = &ctx.accounts.spl_token_program;
            let authority = &ctx.accounts.signer;

            // transfer to charity wallet
            let cpi_accounts = SplTransfer {
                from: from.to_account_info().clone(),
                to: to.to_account_info().clone(),
                authority: authority.to_account_info().clone(),
            };
            let cpi_program = token_program.to_account_info();

            token::transfer(
                CpiContext::new(cpi_program, cpi_accounts),
                campaign.collected,
            )?;
        }

        campaign.number_of_donations += 1;

        match last_donation {
            Some(last_donation) => {
                last_donation.next_donation_pda = Some(donation.key());
            }
            None => {
                campaign.donation_pda = Some(donation.key());
            }
        }

        donation.donation_id = new_id;
        donation.donor_wallet_pubkey = from.owner.key();
        donation.donor_wallet_pda = from.key();
        donation.amount = amount;
        donation.campaign_pda = campaign.key();
        donation.created_at = current_timestamp;
        donation.is_refunded = false;
        donation.next_donation_pda = None;
        donation.campaign_id = campaign.campaign_id.clone();

        Ok(())
    }

    pub fn refund(ctx: Context<RefundAccounts>) -> Result<()> {
        let refund_duration_for_not_cancelled: i64 = 14 * 24 * 60 * 60; // 14 days
        let refund_duration_for_cancelled: i64 = 60 * 24 * 60 * 60; // 60 days
        let clock = Clock::get()?;
        let current_timestamp = clock.unix_timestamp;
        let donation = &mut ctx.accounts.donation;
        let campaign = &mut ctx.accounts.campaign;
        let is_goal_reached = campaign.collected >= campaign.goal;

        if is_goal_reached {
            return err!(CustomError::GoalReached);
        };

        if donation.is_refunded {
            return err!(CustomError::DonationAlreadyRefunded);
        };

        // is after 14 days from the end of the campaign witch not reached the goal
        let first_refund_condition: bool = !is_goal_reached
            && (current_timestamp > (campaign.deadline + refund_duration_for_not_cancelled))
            && !campaign.is_cancelled;

        let second_refund_condition: bool = campaign.is_cancelled
            && (current_timestamp > (campaign.deadline + refund_duration_for_cancelled));

        if !first_refund_condition && !second_refund_condition {
            return err!(CustomError::NoConditionsForCancelledCampaign);
        }

        let from = &ctx.accounts.token_acc_pda;
        let to: &Account<TokenAccount> = &ctx.accounts.donor_wallet_pda;
        let token_program = &ctx.accounts.spl_token_program;
        let authority = &ctx.accounts.signer;
        let cpi_program = token_program.to_account_info();

        let cpi_accounts = SplTransfer {
            from: from.to_account_info().clone(),
            to: to.to_account_info().clone(),
            authority: authority.to_account_info().clone(),
        };

        token::transfer(
            CpiContext::new(cpi_program, cpi_accounts),
            donation.amount,
        )?;

        donation.is_refunded = true;
        campaign.refunded += donation.amount;

        Ok(())
    }
}

#[account]
pub struct Data {
    pub number_of_charities: u64,
    pub charity_pda: Option<Pubkey>,
    pub token_acc_pda: Pubkey,
    pub owner: Pubkey,
}

impl Data {
    pub const SIZE: usize = 500;
}

#[account]
pub struct Charity {
    pub slug: String,
    pub next_charity_pda: Option<Pubkey>,
    pub number_of_campaigns: u64,
    pub campaign_pda: Option<Pubkey>,
    pub created_at: i64,
    pub recipient_wallet_pda: Pubkey,
    pub owner_pubkey: Pubkey,
}

impl Charity {
    pub const SIZE: usize = 500;
}

#[account]
pub struct Campaign {
    pub campaign_id: String,
    pub charity_pda: Pubkey,
    pub next_campaign_pda: Option<Pubkey>,
    pub number_of_donations: u64,
    pub donation_pda: Option<Pubkey>,
    pub deadline: i64,
    pub goal: u64,
    pub collected: u64,
    pub refunded: u64,
    pub created_at: i64,
    pub is_cancelled: bool,
}

impl Campaign {
    pub const SIZE: usize = 500;
}

#[account]
pub struct Donation {
    pub donor_wallet_pubkey: Pubkey,
    pub donor_wallet_pda: Pubkey,
    pub donation_id: String,
    pub amount: u64,
    pub next_donation_pda: Option<Pubkey>,
    pub is_refunded: bool,
    pub campaign_pda: Pubkey,
    pub created_at: i64,
    pub campaign_id: String,
}

impl Donation {
    pub const SIZE: usize = 500;
}

#[derive(Accounts)]
pub struct InitializeAccounts<'info> {
    #[account(init, payer = signer, space = Data::SIZE, seeds = [b"donation-dapp"], bump)]
    pub data: Account<'info, Data>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub token_acc_pda: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(slug: String)]
pub struct CreateCharityAccounts<'info> {
    #[account(
        init, 
        payer = payer, 
        space = Charity::SIZE, 
        seeds = [b"charity", slug.as_bytes().as_ref()], 
        bump )
    ]
    pub charity_pda: Account<'info, Charity>,
    #[account(mut)]
    pub data: Account<'info, Data>,
    #[account(mut)]
    pub last_charity_pda: Option<Account<'info, Charity>>,
    pub recipient_wallet_pda: Account<'info, TokenAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(new_id: String)]
pub struct CreateCampaignAccounts<'info> {
    #[account(mut)]
    pub charity_pda: Account<'info, Charity>,
    #[account(
        init, 
        payer = payer, 
        space = Campaign::SIZE, 
        seeds = [
            b"charity_campaign",
            new_id.as_bytes().as_ref(),
        ],
        bump,
     )
    ]
    pub campaign_pda: Account<'info, Campaign>,
    #[account(mut)]
    pub last_campaign_pda: Option<Account<'info, Campaign>>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelCampaign<'info> {
    campaign_pda: Account<'info, Campaign>,
}

#[derive(Accounts)]
#[instruction(new_id: String)]
pub struct DonateAccounts<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub donor_wallet_pda: Account<'info, TokenAccount>,
    #[account(mut)]
    pub campaign_pda: Account<'info, Campaign>,
    #[account(mut)]
    pub recipient_wallet_pda: Account<'info, TokenAccount>,
    #[account(
        init, 
        payer = signer, 
        space = Donation::SIZE, 
        seeds = [b"donation", new_id.as_bytes().as_ref(),], 
        bump )
    ]
    pub donation: Account<'info, Donation>,
    #[account(mut)]
    pub last_donation: Option<Account<'info, Donation>>,
    pub token_acc_pda: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub spl_token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RefundAccounts<'info> {
    pub signer: Signer<'info>,
    #[account(mut)]
    pub donor_wallet_pda: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_acc_pda: Account<'info, TokenAccount>,
    #[account(mut)]
    pub donation: Account<'info, Donation>,
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    pub system_program: Program<'info, System>,
    pub spl_token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelCampaignAccounts<'info> {
    pub signer: Signer<'info>,
    #[account(mut)]
    pub campaign_pda: Account<'info, Campaign>,
    #[account(mut)]
    pub charity_pda: Account<'info, Charity>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum CustomError {
    #[msg("Slug may only contain 16 characters or less.")]
    InvalidSlugLength,
    #[msg("Slug must be ASCII characters only.")]
    SlugAsciiError,
    #[msg("Last linked list PDA should not contain next address.")]
    LastPdaError,
    #[msg("The campaign ID is already in use.")]
    CampaignIdAlreadyInUse,
    #[msg("Invalid ID length. max 10 characters.")]
    InvalidIdLength,
    #[msg("Invalid donation destination.")]
    InvalidDonationDestination,
    #[msg("Invalid donation owner.")]
    InvalidDonationOwner,
    #[msg("Deadline must be in the future.")]
    InvalidDeadline,
    #[msg("The goal has already been reached.")]
    GoalReached,
    #[msg("The donation has already been refunded.")]
    DonationRefunded,
    #[msg("Only campaign owner can cancel the campaign.")]
    OnlyCampaignOwnerCanCancel,
    #[msg("Can not donate to cancelled campaign.")]
    CanNotDonateToCancelledCampaign,
    #[msg("Donation already refunded.")]
    DonationAlreadyRefunded,
    #[msg("No conditions for cancelled campaigns.")]
    NoConditionsForCancelledCampaign,
    #[msg("Campaign and charity miss-match.")]
    CampaignCharityMissMatch,
}
