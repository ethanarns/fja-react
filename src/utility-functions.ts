    // I'm lazy
// https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid/2117523#2117523
export function getUuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        // eslint-disable-next-line no-mixed-operators
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}