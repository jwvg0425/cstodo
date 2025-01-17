const preprocessContent = (text: string) => {
    return text.trim()
    .split('')
    .filter((chr) => ['\n', '`', '\u202e', '\u202d', '*']
    .find((x) => x === chr) === undefined)
    .join('')
    .replace(/@/g, '[at]');
}

export default preprocessContent;