import 'core-js/stable';
import { log, checkOptions, getFile, createError } from './tools';
import Client from './client';
let reqId = 0;
export default class DocumentUploader {
    constructor(config) {
        this.config = config;
        this.clients = {};
        this.wrapConnection();
    }
    upload(fileOptions) {
        const { debug = false } = this.config;

        const file = getFile(fileOptions);
        checkOptions(file);
        reqId += 1;
        const client = new Client({ send: this.send, file, reqId });
        this.clients[reqId] = { client };
        return new Promise((resolve, reject) => {
            this.clients[reqId].promise = { resolve, reject };
            log(debug, 'Uploading started, File options:', file);
            client.requestUpload();
        });
    }
    wrapConnection() {
        const { connection, debug = false } = this.config;

        if (!connection || connection.readyState !== 1) {
            throw createError('ConnectionError', 'Connection is not ready!');
        }
        this.connection = connection;
        this.send = payload => {
            log(debug, '<Sent>:', payload);
            connection.send(payload);
        };

        const originalOnMessage = connection.onmessage;

        connection.onmessage = response => {
            const { data } = response;

            log(debug, '<Received>:', data);

            const json = JSON.parse(data);
            if (originalOnMessage && (!json.passthrough || !json.passthrough.document_upload)) {
                originalOnMessage.call(connection, response);
                return;
            }

            const { passthrough: { document_upload: isDocumentUpload } } = json;
            if (originalOnMessage && !isDocumentUpload) {
                originalOnMessage.call(connection, response);
                return;
	@@ -69,7 +76,6 @@ export default class DocumentUploader {

            try {
                const result = client.handleMessage(json);

                if (result) {
                    log(debug, 'Upload successful, upload info:', result);
                    promise.resolve(result);
	@@ -80,4 +86,4 @@ export default class DocumentUploader {
            }
        };
    }
}