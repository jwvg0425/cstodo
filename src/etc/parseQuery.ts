
interface Arg {
    key: string,
    value: string | null,
}

export interface QueryType {
    command: string[],
    args: Arg[],    
}

export const getArg = (names: string[], args: Arg[]) => {
    const existNames = names.filter((name) => args.find((arg) => arg.key === name) !== undefined);

    if (existNames.length === 0) return undefined;
    if (existNames.length > 1) return new Error(`같은 인자들 ${names}들이 여러 개 동시에 주어졌습니다.`);
    
    const name = existNames[0];
    
    return args.find((arg) => arg.key === name)!.value;
}

const parseQuery = (rawCommand: string) => {
    const arr = rawCommand.split(' -')

    const command = arr[0].split(' ');
    const args: Arg[] = arr.slice(1).map((str) => {
        const idx = str.indexOf(' ');

        if (idx === -1) return {
            key: '-' + str,
            value: null,
        }

        else return {
            key: '-' + str.slice(0, idx),
            value: str.slice(idx+1).trim(),
        }
    })

    return {
        command,
        args,
    } as QueryType;
}

export default parseQuery;