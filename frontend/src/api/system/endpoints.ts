import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";
import {
  QueryClient,
  UseQueryOptions as ReactUseQueryOptions,
  useQueryClient,
  useMutation as useReactMutation,
  useQuery as useReactQuery,
} from "@tanstack/react-query";

import { prepareMutation, prepareQueryResult } from "./prepare";

type OmitKeysStartingWith<T, Prefix extends string> = {
  [K in keyof T as K extends `${Prefix}${string}` ? never : K]: T[K];
};

type UseQueryOptions<T> = OmitKeysStartingWith<
  ReactUseQueryOptions<T, unknown, T, (string | number)[]>,
  `query`
>;

type QueryEndpointBase<
  Payload,
  Response,
  Entity extends string,
  DefaultValue extends ValueType,
  Nullable extends true | undefined,
  ValueType = [Nullable] extends [true] ? Response | null : Response
> = {
  queryKey: (payload: Payload) => Array<string | number>;
  queryFn: (
    payload: Payload,
    nextContext?: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
  ) => Promise<Response>;
  defaultValue: DefaultValue;
  entity: Entity;
  nullable?: Nullable;
};

export const queryEndpoint = <
  Payload,
  Response,
  Entity extends string,
  DefaultValue extends ValueType,
  Nullable extends true | undefined,
  ValueType = [Nullable] extends [true] ? Response | null : Response
>(
  base: QueryEndpointBase<
    Payload,
    Response,
    Entity,
    DefaultValue,
    Nullable,
    ValueType
  >
) => {
  const fetch = (
    queryClient: QueryClient,
    payload: Payload,
    nextContext?: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
  ) =>
    queryClient.fetchQuery({
      queryKey: base.queryKey(payload),
      queryFn: () => base.queryFn(payload, nextContext),
    });

  const prefetch = (
    queryClient: QueryClient,
    payload: Payload,
    nextContext?: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
  ) =>
    queryClient.prefetchQuery({
      queryKey: base.queryKey(payload),
      queryFn: () => base.queryFn(payload, nextContext),
    });

  const useQuery = (payload: Payload, options?: UseQueryOptions<Response>) => {
    return prepareQueryResult(
      base.entity,
      useReactQuery({
        queryKey: base.queryKey(payload),
        queryFn: () => base.queryFn(payload),
        ...options,
      }),
      base.defaultValue as unknown as Response,
      base.nullable
    );
  };

  return { fetch, prefetch, useQuery };
};

type MutationEndpointBase<Payload, Response, ActionName extends string> = {
  mutationKey: Array<string | number>;
  mutationFn: (payload: Payload) => Promise<Response>;
  actionName: ActionName;
  onSuccess?: (
    queryClient: QueryClient,
    response: Response,
    payload: Payload
  ) => void;
};

export const mutationEndpoint = <Payload, Response, ActionName extends string>(
  base: MutationEndpointBase<Payload, Response, ActionName>
) => {
  const useMutation = () => {
    const queryClient = useQueryClient();
    return prepareMutation<ActionName, Response, Payload>(
      base.actionName,
      useReactMutation({
        mutationKey: base.mutationKey,
        mutationFn: base.mutationFn,
        ...(!!base.onSuccess
          ? {
              onSuccess: (response, payload) => {
                base.onSuccess!(
                  queryClient,
                  response as Response,
                  payload as Payload
                );
              },
            }
          : {}),
      })
    );
  };

  return { fn: base.mutationFn, useMutation };
};
