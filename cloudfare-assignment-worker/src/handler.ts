import { links, imgSrc, name, socials } from './constants';

/**
 * Sends a list of links to the client in json format
 * 
 * @param  {Request} request
 */
function getLinks(request: Request) {
  return new Response(JSON.stringify(links), {
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  })
}

/**
 * Retrieves html from https://static-links-page.signalnerve.workers.dev and send
 * it back to the client
 * 
 * @param  {Request} request
 */
async function getHTML(request: Request) {
  const response = await fetch("https://static-links-page.signalnerve.workers.dev")
  const links:Link[] = JSON.parse(await getLinks(request).text())

  let html = await new HTMLRewriter()
    .on('div#links', {
      element(element) {
        for(let link of links) {
          element.append(`<a href="${link.url}">${link.name}</a>`, {html: true})
        }
      }
    })
    .on('div#profile', {
      element(element) {
        element.removeAttribute('style')
      }
    })
    .on('img#avatar', {
      element(element) {
        element.setAttribute('src', imgSrc)
      }
    })
    .on('h1#name', {
      element(element) {
        element.setInnerContent(name)
      }
    })
    .on('body', {
      element(element) {
        element.setAttribute('class', "bg-gradient-to-r from-teal-400 to-blue-500")
      }
    })
    .on('title', {
      element(element) {
        element.setInnerContent(name)
      }
    })
    .on('div#social', {
      element(element) {
        element.removeAttribute('style')
        for(let social of socials) {
          element.append(`<a href="${social.url}"><img src="${social.svg}"></img></a>`, {html: true})
        }
      }
    })
    .transform(response)
    .text()
      
  return new Response(html, {
    headers: { 'content-type': 'text/html;charset=UTF-8' },
  })
}

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)

  if(url.pathname === '/links') {
    return getLinks(request);
  }

  return await getHTML(request);
}
