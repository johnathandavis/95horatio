import os
import boto3
import json

ddb = boto3.resource('dynamodb')
cognito = boto3.client('cognito-idp')

TABLE_NAME = os.environ['ID_MAPPING_TABLE']
GROUP_NAME = os.environ['GROUP_NAME']
table = ddb.Table(TABLE_NAME)

def handle(event, context):
    print(event)
    attributes = event['request']['userAttributes']
    userPoolId = event['userPoolId']
    cognito_username = event['userName']
    sub = attributes['sub']
    twitch_username = attributes['custom:twitch_username']

    identities = json.loads(attributes['identities'])[0]
    twitch_userid = identities['userId']

    print('Cognito username:', cognito_username)
    print('Twitch username:', twitch_username)
    print('Twitch user id:', twitch_userid)

    table.put_item(
        Item={
            'cognitoId': cognito_username,
            'twitchUsername': twitch_username,
            'twitchId': twitch_userid,
            'sub': sub
        },
    )

    cognito.admin_add_user_to_group(
      UserPoolId=userPoolId,
      Username=cognito_username,
      GroupName=GROUP_NAME
    )

    return event