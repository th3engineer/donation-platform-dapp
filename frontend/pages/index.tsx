import { QueryClient, dehydrate } from "@tanstack/react-query";
import { GetServerSideProps } from "next";

import { homeApi } from "api";
import { Home } from "views";

const HomePage = () => {
  return <Home />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();

  await homeApi.getCampaigns.prefetch(queryClient, null);

  const dehydratedState = dehydrate(queryClient);

  return {
    props: {
      dehydratedState,
    },
  };
};

export default HomePage;
