import { UserType } from '../../database/user';
import { addCstodo, getCstodos } from '../../database/cstodo';
import { emoji } from '../../etc/theme';
import { replySuccess, replyDdokddul, ForceMuteType } from '../../etc/postMessage';
import { getArg, QueryType } from '../../etc/parseQuery';
import stringToTime from '../../etc/stringToTime';
import { reduceEachTrailingCommentRange } from 'typescript';
import preprocessContent from '../../etc/preprocessContent';
import { SlackMessageEvent } from '../../slack/event';

let isSlackDecoration = (text: string) => {
  let match = text.match(/[~_]+/);
  return match !== null && text === match[0];
}

let isQueryValid = (text: string) => {
  return text.length > 0 && text.length <= 200 && !isSlackDecoration(text);
}

let isContentValid = (content: string[]) => {
  if(content.length === 0 || content.length > 25) {
    return `${content.length}개의 쿼리를 넣으시면 저는 똑떨이에요...`;
  }
  if(!content.every(isQueryValid)) {
    return `${content.length}개의 쿼리 중에 다음과 같이 이상한 게 있으면 저는 똑떨이에요...\n:one: 텍스트의 길이가 [1, 100]을 벗어나는 경우\n:two: 텍스트가 underscore(_)나 물결(~)로만 구성된 경우\n:three: 개발자가 잘못 짠 경우`;
  }
  return "";
}

function makeUnique<T>(arr: T[]) {
  return Array.from(new Set<T>(arr));
}

const onTodoAdd = async ({ command, args }: QueryType, event: SlackMessageEvent, user: UserType) => {
  let todo = await getCstodos(user.id);

  const dueArg = getArg(['--due', '-d', '--time', '-t'], args);

  let _due = 0;
  if (!dueArg) {
    _due = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 6).getTime();
  } else if (typeof dueArg === 'string') {
    const time = stringToTime(dueArg);
    if (!time) {
      await replyDdokddul(event, user, `제가 너무 바보같아서 말씀하신 시간을 잘 이해를 못했어요... 죄송합니다...`);
      return;
    }
    _due = time;
  } else {
    await replyDdokddul(event, user, `이런 이유로 저는 똑떨이에요...\n${dueArg.message}`)
    return;
  }

  const due = _due;

  const contents = makeUnique(command.slice(1).join(' ').trim().split(',').map(preprocessContent)).filter(x => {return x.length > 0;});

  const contentValidateErrMsg = isContentValid(contents);
  if (contentValidateErrMsg !== "") {
    await replyDdokddul(event, user, contentValidateErrMsg)
    return;
  }

  await Promise.all(contents.map(async (content) => {
    if (todo.find((item) => item.content === content)) {
      await replyDdokddul(event, user, `이미 할 일에 있는 *${content}* 를 다시 추가하면 똑떨이에요...`)
    } 
    else {
      await addCstodo({
        content,
        owner: user.id,
        due,
      });

      await replySuccess(event, user, `${user.name}님의 할 일에 *${content}* 를 추가했어요!`, 'add', 
        { forceMuteType: user.userControl === 'blacklist' ? ForceMuteType.Unmute : undefined });
    }
  }));
}

export default onTodoAdd;
