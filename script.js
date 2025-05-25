const myList = []; 
const likedList = [];

//fa solo apparire o nascondere la barra di ricerca quando si clicca sul bottone 
const searchBtn = document.querySelector('#searchBtn');
searchBtn.addEventListener('click', () => {
  const searchField = document.querySelector('#searchField');
  searchField.classList.toggle('hidden');
  if (!searchField.classList.contains('hidden')  && searchField.value !== "") {
    console.log(`Searching for: ${searchField.value}`);
  }
});

function scrollCarousel(direction, carousel) {
  const card = carousel.querySelector('.movie-card');
  if (!card) return;

  const style = getComputedStyle(card);
  const cardWidth = card.offsetWidth + parseFloat(style.marginRight);

  const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

  if (direction === 1) {
    if (Math.ceil(carousel.scrollLeft) >= maxScrollLeft) {
      carousel.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  } else if (direction === -1) {
    if (carousel.scrollLeft <= 0) {
      carousel.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
    } else {
      carousel.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  }
}
const newRelease = []; //per riempire la section#newRel
const movieCards = document.querySelectorAll('.card-body'); //tutti i card-body
let idxCardBody; //indice a cui si ferma fillPreview e parte fillNewReleaseSection

window.addEventListener('load', fillPreview);
//funzione che riempie l'anteprima -aka il card-body
function fillPreview() {
  console.log('[fillPreview]: Filling movie cards...');
  console.log(movieCards);
  //chiamata fetch per recuperare i dati dei film
  fetch ('./movies.json')
    .then(data => {
      return data.json();
    })
    .then( post => { 
      console.log('[fillPreview]: Data fetched successfully.');
      console.log(post); //post array di oggetti ~ copia di movies.json
      for (let i = 0; i<post.length; i++) {
        let movie = post[i]; 
        console.log('[fillPreview]: Filling card #' + (i+1) + ' with movie data...');
        console.log(post[i]);
        movieCards[i].querySelector('div>h5').textContent = movie.title;
        movieCards[i].querySelector('div>p').textContent = movie.genre;
        if (movie.newRel) {
          newRelease.push(movie); //aggiungo il film alla lista delle nuove uscite
        }
        console.log('[fillPreview]: newRelease array');
        console.log(newRelease);
        //ne approfitto per riempire la lista dei salvati
        if(movie.saved) {
          addToList(myList, movie.id, movie.title); //aggiungo il film alla lista dei preferiti
        }
  
        if (i === post.length - 1) {
          idxCardBody = i; //salvo l'indice dell'ultimo card-body riempito
          console.log('i: ' + i + ', idxCardBody: ' + idxCardBody);
        }
      } //fine for
      //mi occupo della section#newRel 
      fillNewReleaseSection();
    });
}

function fillNewReleaseSection() {
  console.log('idxCardBody:' + idxCardBody);
  newRelease.reverse(); //solo per cambiare leggermente l'ordine
  
  for (let i=idxCardBody+1; i<movieCards.length; i++) {
    let index = i - idxCardBody - 1; 
    console.log('[fillNR]: index: ' + newRelease[index].title);
    movieCards[i].querySelector('div>h5').textContent = newRelease[index].title;
    movieCards[i].querySelector('div>p').textContent = newRelease[index].genre;
  }
}

const modal = document.getElementById("movieModal");
//funzione che riempie la modale con i dati dei film presi dal file movies.json
function fillMovieModal(movieClicked) {
  const idMovie = parseInt(movieClicked);
  fetch('./movies.json')
    .then (data => {
      return data.json();
    })
    .then (post => {
      const movie = post.find(e => e.id === idMovie); //recupero il film
      console.log('[fillMovieModal]: Filling movie modal...');
      console.log(movie);
      modal.querySelector('img').setAttribute('src', movie.imgUrl); 
      modal.querySelector('img').setAttribute('alt', movie.title.replace(/\s/g, "")); //rimuove gli spazi bianchi dentro al titolo
      let html = '';
      html += `<h2>${movie.title}</h2>`;
      html += `<h3 class="fs-6">${movie.genre}</h3>`;
      html += `<p class="fs-5">${movie.description}</p>`;
      modal.querySelector('.modal-body').innerHTML = html;
      modal.querySelector('.save').setAttribute('onclick', `addToFav(${movie.id}, '${movie.title}')`);
      setSavedIcon(movie.id); //setto l'icona salvata o da salvare

      modal.querySelector('.like').setAttribute('onclick', `addToLiked(${movie.id}, '${movie.title}')`);
      setLikedIcon(movie.id); //setto l'icona liked o no

    });
}

//TODO: RIFALLA!!!! COSì FA SCHIFO
function addToLiked(movieID, movieTitle) {
  if(likedList.some(e => e.id === movieID))
    return;
  addToList(likedList, movieID, movieTitle);
  setLikedIcon(movieID); //setto l'icona salvata o da salvare
  console.log(['likedList:']);
  console.log(likedList);
}

//TODO: funzione per cambiare l'icona
//funzione che aggiunge SOLO ai preferiti 
function addToFav(movieID, movieTitle) {
  if (myList.some(e => e.id === movieID))  //c'è già
    return;
  addToList(myList, movieID, movieTitle);
  setSavedIcon(movieID); //setto l'icona salvata o da salvare
}

function setSavedIcon(movieID) {
  const saved = myList.some(e => e.id === movieID);
  const icon = modal.querySelector('#toggleSaved i');
  icon.classList.add('fade-out');
  setTimeout(() => {
    icon.className = saved ? 'bi bi-check-circle' : 'bi bi-plus-circle';
    icon.classList.remove('fade-out');
  }, 300);
}

function setLikedIcon(movieID) {
  const liked = likedList.some(e => e.id === movieID);
  console.log('[setLikedIcon]: liked: ' + liked);
  const icon = modal.querySelector('#toggleLiked i');

  setTimeout(() => {
    icon.className = liked ? 'bi bi-hand-thumbs-up-fill' : 'bi bi-hand-thumbs-up';
    icon.classList.add('pop');
    setTimeout(() => {
      icon.classList.remove('pop');
    }, 300);
  }, 300);
}

//per ora non ci sono controlli se l'elem è gia presente -> 
//TODO: check se è già in lista -> remove ?? 
//funzione che aggiunge un film a myList
function addToList(myArray, movieID, movieTitle) {
  let elem = {
    id: movieID,
    title: movieTitle,
  }
  myArray.push(elem); //aggiungo il film alla lista
  console.log('[addToFav]: Added movie to myList:' + movieTitle );
}


function fillMyListModal() {
  // console.log('[fillMyListModal]: myList: ');
  // console.log(myList);
  const mylistModal = document.getElementById("myListModal");
  let html = '';
  if (myList.length === 0)
    html += '<p class="fs-1 m-3">Your list is empty</p>';
  else {
    html += '<ul class="fs-4">';
    for (let i = 0; i<myList.length; i++) {
      html+=`<li><span class="movieName"> ${myList[i].title}</span><i class="bi bi-arrows-angle-expand" data-bs-toggle="modal" data-bs-target="#movieModal" onclick="fillMovieModal(${myList[i].id})"></i></li>`
    }
    html += '</ul>';
  }

  mylistModal.querySelector('#myListModal .modal-body').innerHTML = html;
}

function removeFromList (myArray, movieID) {
  const index = myArray.findIndex(e => e.id === movieID);
  if (index !== -1) {
    myArray.splice(index, 1); //rimuovo l'elemento
    console.log('[removeFromList]: id elem rimosso: ' + movieID);
  }
}