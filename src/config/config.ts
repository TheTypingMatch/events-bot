const colors: any = {
    red: 0xE84444,
    yellow: 0xF09F19,
    green: 0x40AC7B
}

const version: string = '0.0.0'
const prefix: string = '/'
const devMode: boolean = false
const logEnabled: boolean = false
const uriParams: any = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    keepAlive: true
}

export {
    colors, version, prefix, 
    devMode, logEnabled, uriParams
}
