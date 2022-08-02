const fs = require("fs")
const md5 = require("md5")

const Difficulty = require("../models/difficulty")

const { promisify } = require("util")
const { exec } = require("child_process")

const execAsync = promisify(exec)

function serializeHitObjects(hitObjects) {
    let out = ""

    for (let hitObject of hitObjects) {
        out += `${hitObject.Time}${hitObject.Type}${hitObject.Duration || ""}`
    }

    return out
}

module.exports = (fastify, opts, done) => {
    fastify.post("/", async (request, reply) => {
        const strBody = JSON.stringify(request.body)

        const hash = md5(serializeHitObjects(request.body.HitObjects))

        if (!fs.existsSync(`./songs/${hash}`)) {
            await fs.writeFileSync(`./_maps/${hash}.json`, strBody)
        }

        const difficulty = await Difficulty.findOne({ SongMD5Hash: hash })

        if (difficulty) {
            await reply.send(difficulty.Difficulties)
            return
        }

        const { stdout, stderr } = await execAsync(`cat ./_maps/${hash}.json | minacalc`)

        if (stderr) {
            await reply.code(500).send({ error: stderr })
            return
        }

        const rawDifficulties = JSON.parse(stdout)

        const difficulties = rawDifficulties.map(difficulty => {
            return {
                Overall: difficulty.Overall,
                Chordjack: difficulty.Chordjack,
                Handstream: difficulty.Handstream,
                Jack: difficulty.Jack,
                Jumpstream: difficulty.Jumpstream,
                Stamina: difficulty.Stamina,
                Stream: difficulty.Stream,
                Technical: difficulty.Technical,
            }
        })

        const diff = new Difficulty({
            SongMD5Hash: hash,
            Difficulties: difficulties,
        })

        await diff.save()

        await reply.send(JSON.parse(stdout))
    })

    done()
}