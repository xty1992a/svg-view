#!/usr/bin/env node

const glob = require('glob')
const path = require('path')
const fs = require('fs')
const http = require('http')
const open = require('open');
const {execSync} = require('child_process');
const argv = require('minimist')(process.argv.slice(2), {
    string: ['port', 'dir'],
    alias: {
        port: 'p',
        dir: 'd'
    }
});


async function main() {
    const hostname = '127.0.0.1'
    const port = argv.port || 3000
    const dir = argv.dir || process.cwd()
    const here = (__p) => path.resolve(dir, __p)

    const onText = (req, res) => {
        const icons = glob.sync(here('*.svg')).map((svg) => {
            return {
                svg: svg,
                name: path.parse(svg).name,
            }
        })

        const svgText = icons
            .map((n) => {
                return `<div class="icon-item" onclick="copy('${n.name}')">
                            <div class="icon">${fs.readFileSync(n.svg)}</div>
                            <p class="name">${n.name}</p>
                        </div>`
            })
            .join('')

        res.end(`<html>
        <head>
          <title>svg icon</title>
          <script src="https://unpkg.com/@redbuck/toast@0.0.6/lib/toast.js"></script>
          <link rel="stylesheet" href="https://unpkg.com/@redbuck/toast@0.0.6/lib/toast.css" >
          <style>
              body{
                  display:flex;
                  flex-wrap: wrap;
                  align-items: flex-start;
              }
        
              .icon-item{
                  width: 200px;
                  text-align: center;
                  padding: 10px;
              }
              
              .icon-item:hover{
                box-shadow: 2px 0 8px rgba(0,0,0,0.08);
              }
        
              .icon{
                  margin: 0 auto;
                  width: 40px;
                  height: 40px;
              }
              svg{
                  width: 100%;
                  height: 100%
              }
              
              .name{
                word-break: break-all;
                margin: 0;
                line-height: 40px;
              }
            </style>
            <script>
            function copy(name) {
            // const name = this.dataset.name
                console.log(name)
                fetch('/copy?name='+name)
                .then(res => res.json())
                .then(res => {
                    console.log(res)
                    if (res.code) return
                    Toast(res.data + ' copied !')
                })
                .catch(e => {
                    console.log('copy fail')
                })
            }
</script>
        </head>
        <body>
        ${svgText}
        </body>
</html>`)
    }

    const onCopy = (req, res) => {
        const search = new URLSearchParams(req.url.split('?')[1])

        const icons = glob.sync(here('*.svg')).map((svg) => {
            return {
                svg: svg,
                name: path.parse(svg).name,
            }
        })

        const filePath = icons.find(it => it.name === search.get('name'))

        if (filePath) {
            console.log('will copy ', filePath.svg)
            const {dir, base} = path.parse(filePath.svg)

            execSync(`${path.resolve(__dirname, './copy.sh')} ${base}`, {
                stdio: "ignore",
                cwd: dir
            })
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({code: 0, data: search.get('name')}))
    }


    const server = http.createServer((request, response) => {
        const [path] = request.url.split('?')
        console.log(request.url, path)
        switch (path) {
            case '/':
                onText(request, response)
                break
            case '/copy':
                onCopy(request, response)
                break
            default:
                response.end('Not Found')
                break
        }
    })

    server.listen(port, hostname, () => {
        open(`http://${hostname}:${port}/`)
        console.log(`Server running at http://${hostname}:${port}/`)
    })

    process.on('exit', () => {
        server.close()
    })
}

main()
