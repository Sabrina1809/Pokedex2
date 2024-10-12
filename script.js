let baseURL = 'https://pokeapi.co/api/v2/pokemon?limit=50&offset=';
let offset = 0;

let allPokemonNameAndUrl = [];
let allPokemonNames = [];
let allPokemonDetails = []
let allPokemonMoreDetails = []
let unfilteredPokemon = []
let unfilteredPokemonInfo = []

async function fetchAllPokemonNames() {
    let response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0');
    let responseAsJson = await response.json();
    allPokemonNames = responseAsJson;
    document.getElementById("loadingspinner_ctn").style.display = "none";
    console.log('all Pokemon names: ', allPokemonNames);
    loadUnfilteredPokemon(allPokemonDetails)
}

async function loadUnfilteredPokemon(allPokemonDetails) {
    let response = await fetch(baseURL + `${offset}`);
    let dataAllPokemon = await response.json();
    let namesAndURL = dataAllPokemon.results;
    // console.log(namesAndURL)
    let promisesSinglePokemon = namesAndURL.map(pokemon => fetch(pokemon.url).then(res => res.json()));
    allPokemonDetails = await Promise.all(promisesSinglePokemon); 
    console.log('allPokemonDetails: ', allPokemonDetails)
    let promisesallPokemonMoreDetails = allPokemonDetails.map(pokemon => fetch(pokemon.species.url).then(res => res.json()));
    allPokemonMoreDetails = await Promise.all(promisesallPokemonMoreDetails); 
    allPokemonMoreDetails = allPokemonMoreDetails
    console.log('allPokemonMoreDetails: ', allPokemonMoreDetails)
    unfilteredPokemon = await connectArrays(allPokemonDetails, allPokemonMoreDetails)
    // unfilteredPokemon = unfilteredPokemon;
    console.log('unfiltered Pokemon: ', unfilteredPokemon)
    checkPokemonInfo(unfilteredPokemon, allPokemonMoreDetails)
    offset = offset + 50 
}

async function connectArrays(allPokemonDetails, allPokemonMoreDetails) {
    let evochain = await checkEvoChain(allPokemonMoreDetails);

    let moreDetailsMap = new Map(allPokemonMoreDetails.map(pokemon => [pokemon.id, pokemon]));
    let evochainMap = new Map(evochain.map(evolution => [evolution.id, evolution]));

    for (let i = 0; i < allPokemonDetails.length; i++) {

        let pokemonDetails = allPokemonDetails[i];
        let pokemonID = pokemonDetails.id;

        let moreDetails = moreDetailsMap.get(pokemonID) || {}; // Fallback auf leeres Objekt, wenn keine Details vorhanden
        let evolutionDetails = evochainMap.get(pokemonID) || {}; // Fallb

        let singlePokemon = Object.assign({}, pokemonDetails, moreDetails, evolutionDetails);
        unfilteredPokemon.push(singlePokemon);
    }
    // console.log('unfiltered Pokemon: ', unfilteredPokemon)

    return unfilteredPokemon
}

async function checkEvoChain(allPokemonMoreDetails) {
    let evochainArray = [];
    for (let i = 0; i < allPokemonMoreDetails.length; i++) {
        let responseEvoChain = await fetch(allPokemonMoreDetails[i].evolution_chain.url);
        let evochain = await responseEvoChain.json();
        evochainArray.push(evochain)
    }
    return evochainArray
}

async function checkPokemonInfo(unfilteredPokemon, allPokemonMoreDetails) {
    for (let i = offset; i < unfilteredPokemon.length; i++) {
        if (unfilteredPokemon[i].is_default === true) {
            // console.log(unfilteredPokemon[i].stats)
            unfilteredPokemonInfo.push({
                "id" : unfilteredPokemon[i].id + unfilteredPokemon[i].name,
                "url" : unfilteredPokemon[i].species.url,
                "weight" : unfilteredPokemon[i].weight,
                "height" : unfilteredPokemon[i].height,
                "number" : unfilteredPokemon[i].id, 
                "name" : unfilteredPokemon[i].name, 
                "order" : unfilteredPokemon[i].order,
                "default" : unfilteredPokemon[i].is_default,
                "img" : unfilteredPokemon[i].sprites.other.home.front_default,
                "types" : checkPokemonType(i, unfilteredPokemon), 
                "color" : unfilteredPokemon[i].types[0].type.name,
                "base_experience" : unfilteredPokemon[i].base_experience,
                "abilities" : checkPokemonAbilities(i, unfilteredPokemon),
                "stats" : checkPokemonStats(i, unfilteredPokemon),
                "evolution_chain" : await checkUnfilteredEvoChain(allPokemonNames, allPokemonMoreDetails, i),
                "evolves_from" : allPokemonMoreDetails[i].evolves_from_species,
                "firstSpecies" : unfilteredPokemon[i].species.name 
            })
        }
    }
    renderPokemon(unfilteredPokemonInfo)
    // clearInterval(loadingTextInterval);
    console.log('unfiltered Pokemon Info', unfilteredPokemonInfo) 
}

async function checkUnfilteredEvoChain(allPokemonNames, allPokemonMoreDetails, i) {
    let responseEvoChain = await fetch(allPokemonMoreDetails[i].evolution_chain.url);
    let evochain = await responseEvoChain.json();
return evochain
}

function checkPokemonType(i, filteredOrUnfilteredPokemon) {
    let pokemonTypeArray = [];
    for (let j = 0; j < filteredOrUnfilteredPokemon[i].types.length; j++) {
        pokemonTypeArray.push(filteredOrUnfilteredPokemon[i].types[j].type.name)
    }
    return pokemonTypeArray
}

function checkPokemonAbilities(i, filteredOrUnfilteredPokemon) {
    let pokemonAbilitiesArray = [];
    for (let j = 0; j < filteredOrUnfilteredPokemon[i].abilities.length; j++) {
        pokemonAbilitiesArray.push(filteredOrUnfilteredPokemon[i].abilities[j].ability.name)
    }
    return pokemonAbilitiesArray
}

function checkPokemonStats(i, filteredOrUnfilteredPokemon) {
    let pokemonStatsArray = [];
    for (let j = 0; j < filteredOrUnfilteredPokemon[i].stats.length; j++) {
        pokemonStatsArray.push({"name" : filteredOrUnfilteredPokemon[i].stats[j].stat.name, "base_stat" : filteredOrUnfilteredPokemon[i].stats[j].base_stat})
    }
    return pokemonStatsArray
}

async function renderPokemon(filteredOrUnfilteredPokemonInfo) {
    let numberToShow = checkNumberToShow(filteredOrUnfilteredPokemonInfo);
    cardTemplate(numberToShow)
    document.getElementById("show_more").className = `${numberToShow}`;
    // window.scrollTo({top: 0});
}

function cardTemplate(numberToShow) {
    // disableButton(numberToShow)
    let lastShownNumber = Number(document.getElementById("show_more").className);
    for (let i = lastShownNumber; i < numberToShow; i++) {
        let card_footer_innerHTML = setTypesToPokemon(unfilteredPokemonInfo, i);
        document.getElementById("cards_area").innerHTML += `
            <div class="card" onclick="openOverlay(event)" id="${unfilteredPokemonInfo[i].id}">
                <div class="card_header">
                    <span id="number_pokemon">#${unfilteredPokemonInfo[i].number}</span>
                    <span id="name_pokemon">${unfilteredPokemonInfo[i].name}</span>
                </div>
                <div class="card_img_pokemon_ctn ${unfilteredPokemonInfo[i].types[0]}">
                    <img class="card_img_pokemon" src="${unfilteredPokemonInfo[i].img}" alt="${unfilteredPokemonInfo[i].name}">
                </div>
                <div id="card_footer_${unfilteredPokemonInfo[i].id}" class="card_footer">
                    ${card_footer_innerHTML}
                </div>
            </div>`
    }
}

function setTypesToPokemon(unfilteredPokemon, i) {
    let typeImgCollection = "";
    for (let j = 0; j < unfilteredPokemon[i].types.length; j++) {
        typeImgCollection += `
            <img class="icon_type_of_pokemon ${unfilteredPokemon[i].types[j]}" src="./img/types/${unfilteredPokemon[i].types[j]}.svg" alt="${unfilteredPokemon[i].types[j]}">
            `;
    }
    typeImgCollection = typeImgCollection
    return typeImgCollection
}

function checkNumberToShow(unfilteredPokemon) {
    let number;
    let lastShownNumber = Number(document.getElementById("show_more").className);
    let remainingPokemon = unfilteredPokemon.length - lastShownNumber;
        if (remainingPokemon > 20) {
            number = lastShownNumber + 20
        } else {
            number = lastShownNumber + remainingPokemon
        }
    return number    
}

function showMore() {
    loadUnfilteredPokemon()
    let numberToShow = checkNumberToShow(unfilteredPokemon)
    cardTemplate(numberToShow)
    document.getElementById("show_more").className = numberToShow;
}

function checkPokemonIndex(allPokemonDetails, allPokemonMoreDetails, i) {
    let index
    for (let j = 0; j < allPokemonDetails.length; j++)
    if (allPokemonMoreDetails[i].chain.evolves_to[0].species.name == allPokemonDetails[j].name) {
        index = j
    }
    return index
}