import { replyMessage } from '../../etc/postMessage';
import { SlackCommand } from '../../slack/command';
import { SlackMessageEvent } from '../../slack/event';
import { SlackReplyMessageCommand } from '../../slack/replyMessage';
import isAttack from '../isAttack';

function onEcho(event: SlackMessageEvent): SlackCommand[] {
    const attack = isAttack(event);
    if (attack) {
        return [attack];
    }
//    if (event.thread_ts && Number.parseFloat(event.thread_ts) < (new Date().getTime() / 1000) - 5 * 60) return;
    
    const text : string = event.text;
    const tokens = text.split(' ').map((token) => token.trim());

    let preprocessQuery = (text: string) => {
        return text.trim().split('').filter((chr) => ['<', '>', '\u202e', '\u202d'].find((x) => x === chr) === undefined).join('').slice(0, 600);
    }  

    const query = preprocessQuery(tokens.slice(1).join(' '));

    return [
        new SlackReplyMessageCommand(event, undefined, {
            text: query,
            channel: event.channel,
            thread_ts: event.thread_ts,
        })
    ];
}

export default onEcho;