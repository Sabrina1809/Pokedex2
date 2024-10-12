const inputField = document.getElementById("search");
let filteredPokemonNames = [];
let filteredPokemonDetails = [];
let filteredPokemonMoreDetails = [];
let filteredPokemon = [];
let filteredPokemonInfo = [];

function getFilter() {
    let filter = document.getElementById("search").value
    console.log(filter)

    if (filter.length > 0) {
        setPlaceholder('gray')
        checkNamesArray(filter)
    } else {
        setPlaceholder('red');
    }
    document.getElementById("show_more").className = "0";
}

function setPlaceholder(color) {
    inputField.value = "";
    inputField.setAttribute("placeholder", "mind. 3 Zeichen");
    inputField.style.setProperty('--placeholder-color', color);
}

function checkNamesArray(filter) {
    for (let i = 0; i < allPokemonNames.results.length; i++) {
        if (allPokemonNames.results[i].name.includes(filter)) {
            filteredPokemonNames.push(allPokemonNames.results[i])
        }
    }
    // filteredPokemonNames = filteredPokemonNames
    console.log('filterdPokemonNames', filteredPokemonNames)
    loadFilteredPokemon()
}

async function loadFilteredPokemon() {
    let promisesSinglePokemon = filteredPokemonNames.map(pokemon => fetch(pokemon.url).then(res => res.json()));
    filteredPokemonDetails = await Promise.all(promisesSinglePokemon); 
    console.log('filteredPokemonDetails', filteredPokemonDetails)
    let promisesallPokemonMoreDetails = filteredPokemonDetails.map(pokemon => fetch(pokemon.species.url).then(res => res.json()));
    filteredPokemonMoreDetails = await Promise.all(promisesallPokemonMoreDetails); 
    console.log('filteredPokemonMoreDetails', filteredPokemonMoreDetails);
    filteredPokemon = await connectFilteredArrays(filteredPokemonDetails, filteredPokemonMoreDetails)
    // filteredPokemon = filteredPokemon;

    console.log('filteredPokemon', filteredPokemon)
    checkFilteredPokemonInfo(filteredPokemon, filteredPokemonMoreDetails, filteredPokemonInfo)
}

async function connectFilteredArrays(filteredPokemonDetails, filteredPokemonMoreDetails) {
    let evochain = await checkEvoChain(filteredPokemonMoreDetails);
    let moreDetailsMap = new Map(allPokemonMoreDetails.map(pokemon => [pokemon.id, pokemon]));
    let evochainMap = new Map(evochain.map(evolution => [evolution.id, evolution]));

    for (let i = 0; i < filteredPokemonDetails.length; i++) {

        let pokemonDetails = filteredPokemonDetails[i];
        let pokemonID = pokemonDetails.id;

        let moreDetails = moreDetailsMap.get(pokemonID) || {}; // Fallback auf leeres Objekt, wenn keine Details vorhanden
        let evolutionDetails = evochainMap.get(pokemonID) || {}; 

        let singleFilteredPokemon = Object.assign({}, pokemonDetails, moreDetails, evolutionDetails);
        filteredPokemon.push(singleFilteredPokemon);
    }
    // console.log('filtered Pokemon', filteredPokemon);
    return filteredPokemon
}

async function checkFilteredPokemonInfo(filteredPokemon, filteredPokemonMoreDetails, filteredPokemonInfo) {
    for (let i = 0; i < filteredPokemon.length; i++) {
        if (filteredPokemon[i].is_default === true) {
            // console.log(filteredPokemon[i].id)
            filteredPokemonInfo.push({
                "id" : filteredPokemon[i].id + filteredPokemon[i].name,
                "url" : filteredPokemon[i].species.url,
                "weight" : filteredPokemon[i].weight,
                "height" : filteredPokemon[i].height,
                "number" : filteredPokemon[i].id, 
                "name" : filteredPokemon[i].name, 
                "order" : filteredPokemon[i].order,
                "default" : filteredPokemon[i].is_default,
                "img" : filteredPokemon[i].sprites.other.home.front_default,
                "types" : checkPokemonType(i, filteredPokemon), 
                "color" : filteredPokemon[i].types[0].type.name,
                "base_experience" : filteredPokemon[i].base_experience,
                "abilities" : checkPokemonAbilities(i, filteredPokemon),
                "stats" : checkPokemonStats(i, filteredPokemon),
                "evolution_chain" : await checkFilteredEvoChain(allPokemonNames, filteredPokemonMoreDetails, i),
                "evolves_from" : filteredPokemonMoreDetails[i].evolves_from_species,
                "firstSpecies" : filteredPokemon[i].species.name 
            })
        }
    }
    renderPokemon(filteredPokemonInfo)
    // clearInterval(loadingTextInterval);
    console.log('filtered Pokemon Info', filteredPokemonInfo) 
}

async function checkFilteredEvoChain(allPokemonNames, filteredPokemonMoreDetails, i) {
    allPokemonNames = allPokemonNames
    let responseEvoChain = await fetch(filteredPokemonMoreDetails[i].evolution_chain.url);
    let evochain = await responseEvoChain.json();
    return [
        {
        "firstPokemon" : await checkEvoP1(allPokemonNames, evochain),
        "secondPokemon" : await checkEvoP2(allPokemonNames, evochain),
        "thirdPokemon" : await checkEvoP3(allPokemonNames, evochain)
        }
    ]
}

async function checkEvoP1(allPokemonNames, evochain) {
    if (evochain.chain.species.name == null) {
        return null
    } else {
        return {
            "name" : evochain.chain.species.name,
            "img" : await getPokemonImg(allPokemonNames, evochain.chain.species.name)
        } 
    }
}

async function checkEvoP2(allPokemonNames, evochain) {
    if (evochain.chain.evolves_to.length == 0) {
        return null
    } else {
        return {
            "name" : evochain.chain.evolves_to[0].species.name,
            "img" : await getPokemonImg(allPokemonNames, evochain.chain.evolves_to[0].species.name)
        } 
    }
}

async function checkEvoP3(allPokemonNames, evochain) {
    if (evochain.chain.evolves_to.length == 0) {
        return null
    } 
    if (evochain.chain.evolves_to[0].evolves_to.length == 0) {
        return null
    } else {
        return {
            "name" : evochain.chain.evolves_to[0].evolves_to[0].species.name,
            "img" : await getPokemonImg(allPokemonNames, evochain.chain.evolves_to[0].evolves_to[0].species.name)
        } 
    }
}

async function getPokemonImg(allPokemonNames, evochainName) {
    for (let i = 0; i < allPokemonNames.results.length; i++) {
        if (allPokemonNames.results[i].name == evochainName) {
            let response = await fetch(allPokemonNames.results[i].url);
            let responseAsJson = await response.json();
            return responseAsJson.sprites.other.home.front_default
        }
    }
}

// function renderPokemon(filteredOrUnfilteredPokemonInfo) {
//     let numberToShow = checkNumberToShowFiltered(filteredOrUnfilteredPokemonInfo);
//     cardTemplateFiltered(numberToShow)
//     document.getElementById("show_more").className = `${numberToShow}`;
//     // window.scrollTo({top: 0});
// }

function cardTemplateFiltered(numberToShow) {
    // disableButton(numberToShow)
   
     document.getElementById("cards_area").innerHTML = "";
    let lastShownNumber = Number(document.getElementById("show_more").className);
    for (let i = lastShownNumber; i < numberToShow; i++) {
        let card_footer_innerHTML = setTypesToPokemon(filteredPokemonInfo, i);
        document.getElementById("cards_area").innerHTML += `
            <div class="card" onclick="openOverlay(event)" id="${filteredPokemonInfo[i].id}">
                <div class="card_header">
                    <span id="number_pokemon">#${filteredPokemonInfo[i].number}</span>
                    <span id="name_pokemon">${filteredPokemonInfo[i].name}</span>
                </div>
                <div class="card_img_pokemon_ctn ${filteredPokemonInfo[i].types[0]}">
                    <img class="card_img_pokemon" src="${filteredPokemonInfo[i].img}" alt="${filteredPokemonInfo[i].name}">
                </div>
                <div id="card_footer_${filteredPokemonInfo[i].id}" class="card_footer">
                    ${card_footer_innerHTML}
                </div>
            </div>`
    }
}

function checkNumberToShowFiltered(filteredPokemon) {
    let number;
    let lastShownNumber = Number(document.getElementById("show_more").className);
    let remainingPokemon = filteredPokemon.length - lastShownNumber;
        if (remainingPokemon > 20) {
            number = lastShownNumber + 20
        } else {
            number = lastShownNumber + remainingPokemon
        }
    return number    
}