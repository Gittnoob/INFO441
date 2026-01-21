import express from 'express';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/urls/preview', async function(req, res) {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'Missing url query parameter.' });
    }

    const response = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Upstream request failed.',
        status: response.status,
        statusText: response.statusText,
      });
    }

    // gets the html, parses it, and selects all the meta tags with open graph information
    const html = await response.text();
    const root = parse(html);
    const metaTags = root.querySelectorAll('meta');
    const ogTags = metaTags.filter(tag => {
      const rawProperty = tag.getAttribute('property') || tag.getAttribute('name') || '';
      const property = rawProperty.toLowerCase().trim();
      return property.startsWith('og:');
    });

    // attempts to gather url, title, image, description

    const ogInfo = {
      url: '',
      title: '',
      image: '',
      description: ''
    }

    // loops through the elements to populate the 4 tags
    ogTags.forEach(tag => {
      const property = (tag.getAttribute('property') || tag.getAttribute('name') || '').toLowerCase().trim();
      const content = tag.getAttribute('content');

      if(property === 'og:url') ogInfo.url = content;
      if(property === 'og:title') ogInfo.title = content;
      if((property === 'og:image' || property === 'og:image:url' || property === 'og:image:secure_url') && !ogInfo.image) ogInfo.image = content;
      if(property === 'og:description') ogInfo.description = content;
    });

    let imageAlt = '';
    if(ogInfo.image) {
      const imgEl = root.querySelectorAll('img').find(img => {
        const src = img.getAttribute('src') || '';
        return src === ogInfo.image || src.includes(ogInfo.image);
      });
      if (imgEl) {
        imageAlt = imgEl.getAttribute('alt') || '';
      }
    }

    console.log('status', response.status);
    console.log('html head', html.slice(0, 500));
    console.log('ogTags', ogTags.length);


    // backups in case any of the tags aren't populated

    if(!ogInfo.url) ogInfo.url = url;
    if(!ogInfo.title) {

      const titleTag = root.querySelector('title');
      if (titleTag && titleTag.text) {
        ogInfo.title = titleTag.text;
      } else {
        ogInfo.title = url;
      }
    }


    // creates the html to be send back

    let description = '';
    if(ogInfo.description) description = `<p>${ogInfo.description}</p>`
    let image = '';
    if(ogInfo.image) {
      const altText = imageAlt ||  `Preview image for ${ogInfo.title}`;
      image = `<img src= "${ogInfo.image}" alt="${altText}" style="max-height: 200px; max-width: 270px;">`;
    }

    var result = `
      <div style="max-width: 300px; border: solid 1px; padding: 3px; text-align: center;">
        <a href="${ogInfo.url}">
          <p><strong> 
              ${ogInfo.title}
          </strong></p>
          ${image}
        </a>
        ${description}
      </div>
    `
    console.log(result);
    res.send(result);
  }
  
  catch (error) {
    res.status(500).json({ error: 'Request failed.' });
  }
});

export default router;
