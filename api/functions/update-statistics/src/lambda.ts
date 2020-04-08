import { updateGbStatistics } from "./handler";

export const handler = async function(event:any) {
    await updateGbStatistics();
}