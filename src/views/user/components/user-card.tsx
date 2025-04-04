import { memo } from "react";
import { Flex, FlexProps } from "@chakra-ui/react";

import UserDnsIdentity from "../../../components/user/user-dns-identity";
import { UserFollowButton } from "../../../components/user/user-follow-button";
import UserLink from "../../../components/user/user-link";
import UserAvatarLink from "../../../components/user/user-avatar-link";

export type UserCardProps = { pubkey: string; relay?: string } & Omit<FlexProps, "children">;

export const UserCard = memo(({ pubkey, relay, ...props }: UserCardProps) => {
  return (
    <Flex p="1" overflow="hidden" gap="4" alignItems="center" {...props}>
      <UserAvatarLink pubkey={pubkey} />
      <Flex direction="column" flex={1} overflow="hidden">
        <UserLink pubkey={pubkey} fontWeight="bold" />
        <UserDnsIdentity pubkey={pubkey} />
      </Flex>
      <UserFollowButton pubkey={pubkey} size="sm" variant="outline" flexShrink={0} />
    </Flex>
  );
});
