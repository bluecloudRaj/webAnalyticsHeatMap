export class Website {
    public _id: string;
    public publicKey: string;
    public privateKey: string;
    public pages;
    public settings;

    constructor() {
        this._id = '';
        this.publicKey = '';
        this.privateKey = '';
        this.pages = [];
    }
}
