import { useState } from "react";
import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { kinds, NostrEvent } from "nostr-tools";
import { getReplaceableIdentifier, unixNow } from "applesauce-core/helpers";
import { useEventFactory } from "applesauce-react/hooks";
import { removeCoordinateTag, addCoordinateTag } from "applesauce-factory/operations/tag";

import { StarEmptyIcon, StarFullIcon } from "../../../components/icons";
import { isEventInList } from "../../../helpers/nostr/lists";
import { usePublishEvent } from "../../../providers/global/publish-provider";
import useFavoriteStreams, { FAVORITE_STREAMS_IDENTIFIER } from "../../../hooks/use-favorite-streams";
import { useSigningContext } from "../../../providers/global/signing-provider";

export default function StreamFavoriteButton({
  stream,
  ...props
}: { stream: NostrEvent } & Omit<IconButtonProps, "children" | "aria-label" | "isLoading" | "onClick">) {
  const publish = usePublishEvent();
  const factory = useEventFactory();
  const { finalizeDraft } = useSigningContext();
  const { favorites } = useFavoriteStreams();
  const coordinate = getReplaceableIdentifier(stream);
  const isFavorite = !!favorites && isEventInList(favorites, stream);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    const prev =
      favorites ||
      (await finalizeDraft({
        kind: kinds.Application,
        created_at: unixNow(),
        content: "",
        tags: [["d", FAVORITE_STREAMS_IDENTIFIER]],
      }));

    setLoading(true);
    const draft = await factory.modifyTags(
      prev,
      isFavorite ? removeCoordinateTag(coordinate) : addCoordinateTag(coordinate),
    );
    await publish(isFavorite ? "Unfavorite stream" : "Favorite stream", draft);
    setLoading(false);
  };

  return (
    <IconButton
      icon={isFavorite ? <StarFullIcon boxSize="1.1em" /> : <StarEmptyIcon boxSize="1.1em" />}
      aria-label={isFavorite ? "Unfavorite stream" : "Favorite stream"}
      title={isFavorite ? "Unfavorite stream" : "Favorite stream"}
      onClick={handleClick}
      isLoading={loading}
      color={isFavorite ? "yellow.400" : undefined}
      {...props}
    />
  );
}
