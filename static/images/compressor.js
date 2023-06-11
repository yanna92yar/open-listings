import chokidar from "chokidar"
import fs from "fs"
import paths from "path"
import sharp from "sharp"
import { fileURLToPath } from 'url'
import util from "util"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const copy = util.promisify(fs.copyFile)

const watcher = chokidar.watch(paths.join(__dirname, './'), {
    persistent: true,
    useFsEvents: true,
    usePolling: true,
    awaitWriteFinish: {
        stabilityThreshold: 0,
        pollInterval: 100,
    },
})

const compress = async function (path, name, ext, compressed) {
    const pipeline = await sharp(path)
        .resize({
            width: 1500,
        })
        .withMetadata()
    // debugger
    await pipeline.webp().toFile(`${compressed}.webp`, function (err) {
        //note the directory needs to exist else will throw err
        if (err) console.log(err, `Illegal file : ${name}${ext}`)
    })

    if (ext === '.JPG' || ext === '.jpg' || ext === '.jpeg' || ext === '.JPEG') {
        await pipeline
            .jpeg({
                quality: 70,
            })
            .toFile(`${compressed}.jpg`, function (err, info) {
                if (err) console.log(err)
                else console.log(info)
            })
    } else if (ext === '.png' || ext === '.PNG') {
        await pipeline.png().toFile(`${compressed}.png`, function (err) {
            if (err) console.log(err)
        })
    } else if (ext === '.gif' || ext === '.GIF') {
        await copy(path, `${compressed}.gif`)
    } else {
        await pipeline.jpeg().toFile(`${compressed}.jpg`, function (err) {
            if (err) console.log(err)
        })
    }
}

watcher.on('add', async function (path) {

    const filename = paths.basename(path)
    const name = paths.parse(filename).name
    const ext = paths.parse(filename).ext

    var compressedPath = `./compressed/${name}`
    var compressedFile = `${compressedPath}${ext}`

    
    try {
        fs.accessSync(compressedFile, fs.constants.F_OK | fs.constants.W_OK)
        console.log(`Cache for ${filename} already exists`)
    } catch (err) {
        console.error(`${compressedFile} ${err.code === 'ENOENT' ? 'does not exist' : 'is read-only'}`)

        (async () => {
            await compress(path, name, ext, compressedPath).then((done) => {
                console.log('Compression processed!!')
            })
        })()
    }
})
