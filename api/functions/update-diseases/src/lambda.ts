import { DiseaseListHandler } from "./handler";

type cloudWatchScheduledEvent = {
    "version": string,
    "id": string,
    "detail-type": "Scheduled Event",
    "source": "aws.events",
    "account": string,
    "time": string,
    "region": string,
    "resources": string[],
    "detail": any
}

type customEvent = {
    bucketName: string
}

export const handler = async (event:cloudWatchScheduledEvent | customEvent) => {
    let bucketName = "social-confidence";

    if (isCustomEvent(event)) {
        bucketName = event.bucketName;
    } else {
        if (event.detail["bucketName"] !== undefined)
            bucketName = event.detail["bucketName"]
    }

    let handler = new DiseaseListHandler(bucketName);

    await handler.updateDiseasesForAllCountries();
}

function isCustomEvent(evt: cloudWatchScheduledEvent | customEvent): evt is customEvent {
    return (evt as customEvent).bucketName !== undefined;
}