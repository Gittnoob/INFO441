import fetch from 'node-fetch';
import { parse } from 'node-html-parser';

const escapeHTML = str => String(str).replace(/[&<>'"]/g, 
    tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));

async function getURLPreview(url){
  try {
    if (!url) {
      throw new Error('Missing url query parameter.');
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Upstream request failed: ${response.status} ${response.statusText}`)
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
    if(ogInfo.description) 
      description = `<p>${escapeHTML(ogInfo.description)}</p>`
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
    return(result);
  }
  
  catch (error) {
    throw error;
  }
}

export default getURLPreview;