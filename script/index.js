let episodes = JSON.parse(sessionStorage.getItem('episodes'));
let locations = JSON.parse(sessionStorage.getItem('locations'));

//get all existing episodes and keep in the session storage
async function fillEpisodes()
{
  if (! episodes)
  {
    episodes = {};
    let count = 0;

    let link = "https://rickandmortyapi.com/api/episode?page=1";
    while (link !== null)
    {
      let response = await axios.get(link);
      response.data.results.forEach(episode => {
        episodes[episode.id] = episode.name;
        ++count;
      });
      link = response.data.info.next;
    }

    episodes.size = count;
    sessionStorage.setItem('episodes', JSON.stringify(episodes));
  }

  document.getElementById('counterEpisodes').innerHTML = "EPISODES: " + episodes.size;
}

//get all existing locations and keep in the session storage
async function fillLocations()
{
  if (! locations)
  {
    locations = {};
    let count = 0;

    let link = "https://rickandmortyapi.com/api/location?page=1";
    while (link !== null)
    {
      let response = await axios.get(link);
      response.data.results.forEach(location => {
        locations[location.id] = location.name;
        ++count;
      });
      link = response.data.info.next;
    }

    locations.size = count;
    sessionStorage.setItem('locations', JSON.stringify(locations));
  }

  document.getElementById('counterLocations').innerHTML = "LOCATIONS: " + locations.size;
}

//fill the pagination element
function createPagination(apiInfo)
{
  const nextPage = apiInfo.next;
  const prevPage = apiInfo.prev;

  const nextPageNumberMatch = nextPage?.match(/page=(\d+)/);
  const prevPageNumberMatch = prevPage?.match(/page=(\d+)/);
  let currentPageNumber = nextPageNumberMatch ? parseInt(nextPageNumberMatch[1]) - 1 : undefined;
  currentPageNumber = currentPageNumber ? currentPageNumber : parseInt(prevPageNumberMatch[1]) + 1;

  let paginationContent = "Pages:&nbsp;";
  let currentURL = new URL(window.location.href);

  if (prevPage)
  {
    currentURL.searchParams.set('page', currentPageNumber - 1);
    paginationContent += `<a href="${currentURL.href}"> &lt; ${currentPageNumber - 1} </a> &nbsp; `;
  }
  
  paginationContent += ` ${currentPageNumber} `;

  if(nextPage)
  {
    currentURL.searchParams.set('page', currentPageNumber + 1);
    paginationContent += ` &nbsp; <a href="${currentURL.href}"> ${currentPageNumber + 1} &gt; </a>`;
  }

  document.getElementById('pagination').innerHTML = paginationContent;
}

await fillEpisodes();
await fillLocations();

//Get characters

let currentURL = new URL(window.location.href);
let apiURL = new URL("https://rickandmortyapi.com/api/character");
apiURL.searchParams.set('page', currentURL.searchParams.get('page') || 1);
const searchValue = currentURL.searchParams.get('search');
if (searchValue)
{
  apiURL.searchParams.set('name', searchValue);
  document.getElementById('search').value = searchValue;
}

axios.get(apiURL.href)
  .then(function(response) {
    let cards = "";

    response.data.results.forEach(character => {
      let lastEpisodeId = character.episode.length ? character.episode.pop().split('/').pop() : null;
      let lastEpisode = lastEpisodeId ? episodes[lastEpisodeId] : 'Unknown';

      let statusColor = '#858585';
      if (character.status === 'Dead')
        statusColor = 'red';
      else if (character.status === 'Alive')
        statusColor = 'limegreen';

      cards += `
<div class="card animate__animated animate__fadeIn" onclick="showCharacter(${character.id})">
  <img src="${character.image}" alt="${character.name} image">
  <div class="cardData">
    
    <div class="cardTitle">
      <h2>${character.name}</h2>
      <div>
        <span class="statusIcon" style="color: ${statusColor}">&#x25cf;</span>
        <span>${character.status === "unknown" ? 'Unknown' : character.status} - ${character.species}</span>
      </div>
    </div>

    <div class="cardInfo">
      <h4>Last known location</h4>
      <p>${character.location.name === "unknown" ? 'Unknown' : character.location.name}</p>
    </div>

    <div class="cardInfo">
      <h4>Last seen in</h4>
      <p>${lastEpisode === "unknown" ? 'Unknown' : lastEpisode}</p>
    </div>
  </div>
</div>
      `;

    });

    document.querySelector("#cards").innerHTML = cards;
    document.getElementById('counterCharacters').innerHTML = "CHARACTERS: " + response.data.info.count;

    createPagination(response.data.info);
  })
  .catch(function(error) {
    console.log(error);
  });

//search input event
let searchInput = document.getElementById('search');
searchInput.addEventListener('keyup', (event) =>
{
  if (event.key !== "Enter" )
    return;

  let currentURL = new URL(window.location.href);
  currentURL.searchParams.set('page', 1);

  let searchValue = document.getElementById('search').value;
  if (searchValue)
    currentURL.searchParams.set('search', searchValue);
  else
    currentURL.searchParams.delete('search');

  window.location.href = currentURL.href;
});  

//
window.showCharacter = function(id)
{
  axios.get("https://rickandmortyapi.com/api/character/"+id)
    .then(response => {
      let character = response.data;

      let statusColor = '#858585';
      if (character.status === 'Dead')
        statusColor = 'red';
      else if (character.status === 'Alive')
        statusColor = 'limegreen';

      document.getElementById('modalCharName').innerHTML = character.name;
      document.getElementById('modalAvatar').src = character.image;
      document.getElementById('modalStatusIcon').style.color = statusColor;
      document.getElementById('modalStatus').innerHTML = character.status === "unknown" ? 'Unknown' : character.status;
      document.getElementById('modalSpecies').innerHTML = character.species;
      document.getElementById('modalType').innerHTML = character.type ? character.type : "-";
      document.getElementById('modalGender').innerHTML = character.gender === "unknown" ? 'Unknown' : character.gender;
      document.getElementById('modalOrigin').innerHTML = character.origin.name === "unknown" ? 'Unknown' : character.origin.name;
      document.getElementById('modalLastLocation').innerHTML = character.location.name === "unknown" ? 'Unknown' : character.location.name;

      openModal('characterModal');
    })
    .catch(error => {
      alert("Some error occured while fetting character data. Check the console log.")
      console.log(error);
    })

}