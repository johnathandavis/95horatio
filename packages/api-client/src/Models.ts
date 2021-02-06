export interface GetUserInfoRequest {
}

export interface GetUserInfoResponse {
  discordUsername: string,
  twitchUsername: string,
  cognitoUsername: string
}

export interface SentKudo {
  timestamp: string,
  recipient: string,
  message: string
}

export interface ReceivedKudo {
  timestamp: string,
  message: string
}

export interface SentimentScore {
  value: number,
  rank: number,
  total: number
}

export interface UppercaseSentimentScore {
  Value: number,
  Rank: number,
  Total: number
}

export interface UserSnapshotSummary {
  MessageCount: number,
  Positivity?: UppercaseSentimentScore,
  Negativity?: UppercaseSentimentScore,
  Neutrality?: UppercaseSentimentScore,
  Mixed?: UppercaseSentimentScore,
}

export interface ChatSummary {
  messageCount: number,
  messageCountRank: number,
  positivity: SentimentScore,
  negativity: SentimentScore,
  neutrality: SentimentScore,
  mixed: SentimentScore,
}

export interface ChatMessage {
  message: string,
  timestamp: string,
  sentiment: string,
  positivity: number,
  negativity: number,
  neutrality: number,
  mixed: number,
}
export type ChatProvider = 'Discord' | 'Twitch';
export type ChatOrder = 'Ascending' | 'Descending';
export interface ListChatsRequest {
  provider: ChatProvider,
  order?: ChatOrder,
  paginationToken?: string
}
export interface ListChatsResponse {
  messages: ChatMessage[],
  paginationToken?: string
}

export type GetSentKudosResponse = SentKudo[];
export type GetReceivedKudosResponse = ReceivedKudo[];
export type GetChatSummaryResponse = ChatSummary;

export type AlertType = 'Sentiment' | 'Other';

export interface MessageSentiment {
  Sentiment: string,
  Positivity: number,
  Negativity: number,
  Neutrality: number,
  Mixed: number,
}

export interface SentimentAlert {
  TimestampEpochSeconds: number;
  TwitchUsername: string,
  Message: string,
  Score: MessageSentiment,
  Summary: UserSnapshotSummary
}

export interface Alert {
  Type: AlertType,
  Sentiment: SentimentAlert
}