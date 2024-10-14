let allPokemonNames = [];
let unfilteredPokemonAllDetails = []
let filteredPokemonAllDetails = []
let inputField = document.getElementById("search");
let pokemonArrayToShow = unfilteredPokemonAllDetails;

async function fetchAllPokemonNames() {
    let response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0');
    let responseAsJson = await response.json();
    allPokemonNames = responseAsJson;
    document.getElementById("loadingspinner_ctn").style.display = "none";
    console.log('all Pokemon names: ', allPokemonNames);
    unfilteredPokemonNames = allPokemonNames;
    load50UnfilteredPokemon()
}


















































async function connectArrays(details, moreDetails, allDetails) {

    for (let i = 0; i < details.length; i++) {
        if (details[i].is_default == true) {
            let responseEvoChain = await fetch(moreDetails[i].evolution_chain.url);
            let evochain = await responseEvoChain.json();
            let singlePokemon = Object.assign(
                {}, 
                {"abilities" : details[i].abilities}, 
                {"height" : details[i].height}, 
                {"weight" : details[i].weight}, 
                {"id" : details[i].id}, 
                {"is_default" : details[i].is_default}, 
                {"base_experience" : details[i].base_experience}, 
                {"name" : details[i].name}, 
                {"order" : details[i].order}, 
                {"species" : details[i].species}, 
                {"img" : details[i].sprites.other.home.front_default}, 
                {"stats" : details[i].stats}, 
                {"types" : details[i].types}, 
                {"evolves_from" : moreDetails[i].evolves_from_species}, 
                {"chain" : evochain.chain}, 
            )
            allDetails.push(singlePokemon);
        }
    }
    return allDetails
}

function showMore(pokemonArrayToShow) {

    if (pokemonArrayToShow == unfilteredPokemonAllDetails) {
        load50UnfilteredPokemon()
    } else {
        renderNext20Pokemon(pokemonArrayToShow)
    }
}

function checkNumberToShow(pokemonArrayToShow) {
    let number;
    let lastShownNumber = Number(document.getElementById("show_more").className);
    let remainingPokemon = pokemonArrayToShow.length - lastShownNumber;
        if (remainingPokemon > 20) {
            number = lastShownNumber + 20
        } else {
            number = lastShownNumber + remainingPokemon
        }
    return number    
}

async function renderNext20Pokemon(pokemonArrayToShow) {
    let numberToShow = checkNumberToShow(pokemonArrayToShow);
    cardTemplate(numberToShow, pokemonArrayToShow)
    document.getElementById("show_more").className = `${numberToShow}`;

}

function cardTemplate(numberToShow, pokemonArrayToShow) {
    disableButton(numberToShow)
    let lastShownNumber = Number(document.getElementById("show_more").className);
    for (let i = lastShownNumber; i < numberToShow; i++) {
        let card_footer_innerHTML = setTypesToPokemon(pokemonArrayToShow, i);
        document.getElementById("cards_area").innerHTML += `
            <div class="card" onclick="openOverlay(event)" id="${pokemonArrayToShow[i].id}">
                <div class="card_header">
                    <span id="number_pokemon">#${pokemonArrayToShow[i].id}</span>
                    <span id="name_pokemon">${pokemonArrayToShow[i].name}</span>
                </div>
                <div class="card_img_pokemon_ctn ${pokemonArrayToShow[i].types[0].type.name}">
                    <img class="card_img_pokemon" src="${pokemonArrayToShow[i].img}" alt="${pokemonArrayToShow[i].name}">
                </div>
                <div id="card_footer_${pokemonArrayToShow[i].id}" class="card_footer">
                    ${card_footer_innerHTML}
                </div>
            </div>`
    }
}

function setTypesToPokemon(pokemonArrayToShow, i) {
    let typeImgCollection = "";
    for (let j = 0; j < pokemonArrayToShow[i].types.length; j++) {
        typeImgCollection += `
            <img class="icon_type_of_pokemon ${pokemonArrayToShow[i].types[j].type.name}" src="./img/types/${pokemonArrayToShow[i].types[j].type.name}.svg" alt="${pokemonArrayToShow[i].types[j].type.name}">
            `;
    }
    return typeImgCollection
}

function disableButton(numberToShow) {
    if( numberToShow == pokemonArrayToShow.length) {
        document.getElementById("show_more").style.display = "none";
    } else {
        document.getElementById("show_more").style.display = "flex";
    }
}

function openOverlay(e) {
    let thisPokemonId = checkPokemonId(e) 
    let indexOfPokemonArrayToShow = checkIndexOfPokemonToShow(thisPokemonId)
    document.getElementById("toLeft").className = "buttonLeftRight"
    document.getElementById("toRight").className = "buttonLeftRight"
    document.getElementById("toLeft").classList.add(`${indexOfPokemonArrayToShow}`)
    document.getElementById("toRight").classList.add(`${indexOfPokemonArrayToShow}`)
    fillOverlay(indexOfPokemonArrayToShow) 
    document.getElementById("card_overlay_ctn").style.display = "flex";
    document.getElementById("card_overlay").addEventListener("click", function(e) {
        e.stopPropagation()
    })
}

function checkIndexOfPokemonToShow(thisPokemonId) {
    let pokemonIndex;
    for (let i = 0; i < pokemonArrayToShow.length; i++) {
        if (pokemonArrayToShow[i].id == thisPokemonId) {
            pokemonIndex = i
        }
    }
    return pokemonIndex
}

function checkPokemonId(e) {
    let clickedCard = e.currentTarget;
    let cardId = clickedCard.id;
    return cardId
}

function closeOverlay() {
    document.getElementById("card_overlay_ctn").style.display = "none"
    document.body.style.overflow = ""
}

function fillOverlay(indexOfPokemonArrayToShow) {
    let thisName = pokemonArrayToShow[indexOfPokemonArrayToShow].name;
    let pokemonTypes = setTypesToPokemon(pokemonArrayToShow, indexOfPokemonArrayToShow)
    document.getElementById("overlay_number_pokemon").innerText = `#${pokemonArrayToShow[indexOfPokemonArrayToShow].id}`
    document.getElementById("overlay_name_pokemon").innerText = `${pokemonArrayToShow[indexOfPokemonArrayToShow].name}`
    document.getElementById("imgOverlay").src = `${pokemonArrayToShow[indexOfPokemonArrayToShow].img}`
    document.getElementById("overlay_card_type_of_pokemon_ctn").innerHTML = pokemonTypes;
    document.body.style.overflow = "hidden";
    colorAndAnimation(pokemonArrayToShow, indexOfPokemonArrayToShow)
    addEventListeners(event)
    setInfoMain(pokemonArrayToShow, indexOfPokemonArrayToShow)
    showOverlayInfoMain()
    setInfoStats(pokemonArrayToShow, indexOfPokemonArrayToShow)
    pokemonEvolution(unfilteredPokemonAllDetails, thisName)
}

function colorAndAnimation(pokemonArrayToShow, indexOfPokemonArrayToShow) {
    document.getElementById("imgOverlay").classList.remove("showPokemonAnimation");
    void document.getElementById("imgOverlay").offsetWidth;
    document.getElementById("imgOverlay").classList.add("showPokemonAnimation");
    document.getElementById("overlay_card_img_pokemon_ctn").className = "";    
    document.getElementById("overlay_card_img_pokemon_ctn").classList.add("overlay_card_img_pokemon_ctn");    
    document.getElementById("overlay_card_img_pokemon_ctn").classList.add(`${pokemonArrayToShow[indexOfPokemonArrayToShow].types[0].type.name}`);    
    let statsColor = getComputedStyle(document.getElementById("overlay_card_img_pokemon_ctn")).backgroundColor
    document.documentElement.style.setProperty('--pokemon-type-color', statsColor)
}

function addEventListeners(e) {
    document.getElementById("overlay_menu_main").addEventListener("click", function(e) {
        e.stopPropagation(e)
    })
    document.getElementById("overlay_menu_stats").addEventListener("click", function(e) {
        e.stopPropagation(e)
    })
    document.getElementById("overlay_menu_evochain").addEventListener("click", function(e) {
        e.stopPropagation(e)
    })
    document.getElementById("overlay_card_type_of_pokemon_ctn").addEventListener("click", function(e) {
        e.stopPropagation(e)
    })
    document.getElementById("overlay_card_img_pokemon_ctn").addEventListener("click", function(e) {
        e.stopPropagation(e)
    })
    document.getElementById("card_overlay_header").addEventListener("click", function(e) {
        e.stopPropagation(e)
    })
    document.getElementById("overlay_card_info").addEventListener("click", function(e) {
        e.stopPropagation(e)
    })
}

function setInfoMain(pokemonArrayToShow, indexOfPokemonArrayToShow) {
    let abilities = checkAbilities(pokemonArrayToShow, indexOfPokemonArrayToShow);
    document.getElementById("height").innerText = `${pokemonArrayToShow[indexOfPokemonArrayToShow].height} m`;
    document.getElementById("weight").innerText = `${pokemonArrayToShow[indexOfPokemonArrayToShow].weight} kg`;
    document.getElementById("base_exp").innerText = `${pokemonArrayToShow[indexOfPokemonArrayToShow].base_experience}`;
    document.getElementById("abilities").innerText = `${abilities.join(', ')}`;
}

function checkAbilities(pokemonArrayToShow, indexOfPokemonArrayToShow) {
    let abilitiesArray = []
    for (let i = 0; i < pokemonArrayToShow[indexOfPokemonArrayToShow].abilities.length; i++) {
        abilitiesArray.push(pokemonArrayToShow[indexOfPokemonArrayToShow].abilities[i].ability.name)
    }
    return abilitiesArray
}

function closeOverlayInfos() {
    document.getElementById("overlay_info_main").style.display = "none";
    document.getElementById("overlay_info_stats").style.display = "none";
    document.getElementById("evo_chain").style.display = "none";
    document.getElementById("overlay_menu_main").style.borderBottom = "1px solid transparent";
    document.getElementById("overlay_menu_stats").style.borderBottom = "1px solid transparent";
    document.getElementById("overlay_menu_evochain").style.borderBottom = "1px solid transparent";
}

function showOverlayInfoMain() {
    closeOverlayInfos()
    document.getElementById("overlay_info_main").style.display = "flex";
    document.getElementById("overlay_menu_main").style.borderBottom = "1px solid white";
}

function showOverlayInfoStats() {
    closeOverlayInfos()
    document.getElementById("overlay_info_stats").style.display = "flex";
    document.getElementById("overlay_menu_stats").style.borderBottom = "1px solid white";
}

function setInfoStats(pokemonArrayToShow, indexOfPokemonArrayToShow) {
    document.getElementById("stat1name").innerText = `${pokemonArrayToShow[indexOfPokemonArrayToShow].stats[0].stat.name}`
    document.getElementById("stat1baseStat").style.width = `${pokemonArrayToShow[indexOfPokemonArrayToShow].stats[0].base_stat}%`
    document.getElementById("stat2name").innerText = `${pokemonArrayToShow[indexOfPokemonArrayToShow].stats[1].stat.name}`
    document.getElementById("stat2baseStat").style.width = `${pokemonArrayToShow[indexOfPokemonArrayToShow].stats[1].base_stat}%`
    document.getElementById("stat3name").innerText = `${pokemonArrayToShow[indexOfPokemonArrayToShow].stats[2].stat.name}`
    document.getElementById("stat3baseStat").style.width = `${pokemonArrayToShow[indexOfPokemonArrayToShow].stats[2].base_stat}%`
    document.getElementById("stat4name").innerText = `${pokemonArrayToShow[indexOfPokemonArrayToShow].stats[3].stat.name}`
    document.getElementById("stat4baseStat").style.width = `${pokemonArrayToShow[indexOfPokemonArrayToShow].stats[3].base_stat}%`
    document.getElementById("stat5name").innerText = `${pokemonArrayToShow[indexOfPokemonArrayToShow].stats[4].stat.name}`
    document.getElementById("stat5baseStat").style.width = `${pokemonArrayToShow[indexOfPokemonArrayToShow].stats[4].base_stat}%`
    document.getElementById("stat6name").innerText = `${pokemonArrayToShow[indexOfPokemonArrayToShow].stats[5].stat.name}`
    document.getElementById("stat6baseStat").style.width = `${pokemonArrayToShow[indexOfPokemonArrayToShow].stats[5].base_stat}%`
} 

function showOverlayInfoEvo() {
    closeOverlayInfos()
    document.getElementById("evo_chain").style.display = "flex";
    document.getElementById("overlay_menu_evochain").style.borderBottom = "1px solid white";
}

function pokemonEvolution(unfilteredPokemonAllDetails, thisName) {
    let indexAllPokemon = checkThisIndex(unfilteredPokemonAllDetails, thisName);
    let evo1Name = document.getElementById("evo1PokemonName");
    let evo2Name = document.getElementById("evo2PokemonName");
    let evo3Name = document.getElementById("evo3PokemonName");
    evo3Name.style.display = "flex";
    if (unfilteredPokemonAllDetails[indexAllPokemon].chain.evolves_to[0].evolves_to.length !== 0) {
        evo3Name.innerHTML = unfilteredPokemonAllDetails[indexAllPokemon].chain.evolves_to[0].evolves_to[0].species.name;
    } else {
        evo3Name.style.display = "none"
    }
   
    evo2Name.innerHTML = unfilteredPokemonAllDetails[indexAllPokemon].chain.evolves_to[0].species.name;
    evo1Name.innerHTML = unfilteredPokemonAllDetails[indexAllPokemon].chain.species.name;
    let evo1Index = checkThisIndex(unfilteredPokemonAllDetails, evo1Name.innerHTML);
    let evo2Index = checkThisIndex(unfilteredPokemonAllDetails, evo2Name.innerHTML);
    let evo3Index = checkThisIndex(unfilteredPokemonAllDetails, evo3Name.innerHTML);
   
    setEvoImg(unfilteredPokemonAllDetails, indexAllPokemon, evo1Index, evo2Index, evo3Index)
    setGrayScale(evo1Name, evo2Name, evo3Name, thisName)
}

function setEvoImg(unfilteredPokemonAllDetails, indexAllPokemon, evo1Index, evo2Index, evo3Index) {
    let evo1Img = document.getElementById("evo1PokemonImg");
    let evo2Img = document.getElementById("evo2PokemonImg");
    let evo3Img = document.getElementById("evo3PokemonImg");
    evo3Img.style.display = "flex";
    
    evo1Img.src = unfilteredPokemonAllDetails[evo1Index].img;
    evo2Img.src = unfilteredPokemonAllDetails[evo2Index].img;
  
    if (unfilteredPokemonAllDetails[indexAllPokemon].chain.evolves_to[0].evolves_to.length !== 0) {
        evo3Img.src = unfilteredPokemonAllDetails[evo3Index].img;
    } else {
        evo3Img.style.display = "none"
    }
}

function setGrayScale(evo1Name, evo2Name, evo3Name, thisName) {
    document.getElementById("evo1PokemonImg").style.filter = "grayscale(100%)";
    document.getElementById("evo2PokemonImg").style.filter = "grayscale(100%)";
    document.getElementById("evo3PokemonImg").style.filter = "grayscale(100%)";
    if (evo1Name.innerHTML == thisName) {
        document.getElementById("evo1PokemonImg").style.filter = "grayscale(0%)";
    } else if (evo2Name.innerHTML == thisName) {
        document.getElementById("evo2PokemonImg").style.filter = "grayscale(0%)";
    } else if (evo3Name.innerHTML == thisName) {
        document.getElementById("evo3PokemonImg").style.filter = "grayscale(0%)";
    }
}

function checkThisIndex(unfilteredPokemonAllDetails, thisName) {
    let index;
    for (let i = 0; i < unfilteredPokemonAllDetails.length; i++) {
        if (unfilteredPokemonAllDetails[i].name == thisName) {
            index = i
            return index
        }
    }
    return index
} 

function oneLeftOrRight(e, oneUpOrDown, pokemonArrayToShow) {
    e.stopPropagation()
    
    document.getElementById("toLeft").classList.remove("buttonLeftRight")
    document.getElementById("toRight").classList.remove("buttonLeftRight")
    let currentIndex = Number(document.getElementById("toLeft").className);
    let nextIndex = checkNextIndex(currentIndex, oneUpOrDown, pokemonArrayToShow)
   
    addClassNamesButtons(nextIndex)
    fillOverlay(nextIndex) 
    document.getElementById("card_overlay").addEventListener("click", function(e) {
        e.stopPropagation()
    })
}

function checkNextIndex(currentIndex, oneUpOrDown, pokemonArrayToShow) {
    nextIndex = currentIndex + oneUpOrDown
    if (nextIndex == -1) {
        nextIndex = pokemonArrayToShow.length - 1
    }
    if (nextIndex == pokemonArrayToShow.length) {
        nextIndex = 0
    }
    return nextIndex
}

function addClassNamesButtons(nextIndex) {
    document.getElementById("toLeft").className = "buttonLeftRight"
    document.getElementById("toRight").className = "buttonLeftRight"
    document.getElementById("toLeft").classList.add(`${nextIndex}`)
    document.getElementById("toRight").classList.add(`${nextIndex}`)
}