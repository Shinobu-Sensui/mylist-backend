
interface Tab {
    inArray: string[],
    notInArray: string[]
}


export const wordInArray = (array: string[], words: string[]) : Tab => {
    let len = array.length, tab: Tab = { inArray: [], notInArray: [] }
    for (let i = 0; i < len; i++) {
        if (words.includes(array[i])) {
            tab.inArray.push(array[i])
        } else {
            tab.notInArray.push(array[i])
        }
    }

    return tab
}