import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOrderChat } from "@/hooks/use-order-chat";
import { AlertTriangleIcon, VideoIcon } from "lucide-react";
import { AlertDescription, Alert } from "@/components/ui/alert";
import ErrorCard from "@/components/shared/error-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

const TabChat = ({ paid, orderId }: { paid: boolean; orderId: string }) => {
  const { client, error, channel, canInvite, inviteMutation } = useOrderChat(
    paid,
    orderId,
  );

  if (!paid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Support Chat</CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <Alert className="mx-auto max-w-md border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
            <AlertTriangleIcon />
            <AlertDescription>
              Complete payment to open support chat.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Support Chat</CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <ErrorCard />
        </CardContent>
      </Card>
    );
  }

  if (!client || !channel) {
    return (
      <Card>
        <div className="flex-row flex-wrap items-start gap-4 px-4">
          <Skeleton className="rounded-box h-12 w-12 shrink-0" />
          <div className="mt-2 min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-lg" />
            <Skeleton className="h-4 w-2/3 max-w-md" />
          </div>
        </div>
        <div className="rounded-box border-base-300 bg-base-100 flex h-[560px] flex-col overflow-hidden border">
          <div className="border-base-300 border-b p-4">
            <Skeleton className="skeleton h-8 w-56" />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            <Skeleton className="h-16 w-3/4 max-w-md rounded-lg" />
            <Skeleton className="ml-auto h-14 w-2/3 max-w-sm rounded-lg" />
            <Skeleton className="h-20 w-4/5 max-w-lg rounded-lg" />
          </div>
          <div className="border-base-300 border-t p-3">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Chat</CardTitle>
        <CardDescription>
          Ask about this order, shipping, or returns. Support can send a video
          call link here when needed; both sides use the same Join button.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        {canInvite ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              className=""
              disabled={inviteMutation.isPending}
              onClick={() => inviteMutation.mutate()}
            >
              {inviteMutation.isPending ? (
                <Spinner className="size-4" />
              ) : (
                <VideoIcon className="size-4" aria-hidden />
              )}
              Send video call invite
            </Button>

            {inviteMutation.isError ? (
              <span className="text-destructive text-sm">
                Could not send invite.
              </span>
            ) : null}

            {inviteMutation.isSuccess ? (
              <span className="text-primary text-sm">Invite sent.</span>
            ) : null}
          </div>
        ) : null}
      </CardContent>
      <CardContent className="stream-panel h-140 overflow-hidden border [&_.str-chat\_\_main-panel]:min-h-0">
        <Chat client={client} theme="messaging str-chat__theme-dark">
          <Channel channel={channel}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </CardContent>
    </Card>
  );
};

export default TabChat;
