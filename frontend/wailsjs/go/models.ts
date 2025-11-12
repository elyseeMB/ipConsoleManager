export namespace main {
	
	export class MacLookupResponse {
	    success: boolean;
	    found: boolean;
	    macPrefix: string;
	    company: string;
	    address: string;
	    country: string;
	    blockStart: string;
	    blockEnd: string;
	    blockSize: number;
	    blockType: string;
	    updated: string;
	
	    static createFrom(source: any = {}) {
	        return new MacLookupResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.found = source["found"];
	        this.macPrefix = source["macPrefix"];
	        this.company = source["company"];
	        this.address = source["address"];
	        this.country = source["country"];
	        this.blockStart = source["blockStart"];
	        this.blockEnd = source["blockEnd"];
	        this.blockSize = source["blockSize"];
	        this.blockType = source["blockType"];
	        this.updated = source["updated"];
	    }
	}
	export class Devices {
	    IP: string;
	    MAC: string;
	    TYPE: string;
	    VENDOR: MacLookupResponse;
	    HOSTNAME: string;
	
	    static createFrom(source: any = {}) {
	        return new Devices(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.IP = source["IP"];
	        this.MAC = source["MAC"];
	        this.TYPE = source["TYPE"];
	        this.VENDOR = this.convertValues(source["VENDOR"], MacLookupResponse);
	        this.HOSTNAME = source["HOSTNAME"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

