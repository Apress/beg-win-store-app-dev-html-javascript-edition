var animals = new WinJS.Binding.List([
    { name: "Ant", classification: "Formicidae", pic_sm: "/images/60/Ant.png", pic_lg: "/images/400/Ant.png" },
    { name: "Bat", classification: "Chiroptera", pic_sm: "/images/60/Bat.png", pic_lg: "/images/400/Bat.png" },
    { name: "Bee", classification: "Anthophila", pic_sm: "/images/60/Bee.png", pic_lg: "/images/400/Bee.png" },
    { name: "Bird", classification: "Aves", pic_sm: "/images/60/Bird.png", pic_lg: "/images/400/Bird.png" },
    { name: "Bug", classification: "Insecta", pic_sm: "/images/60/Bug.png", pic_lg: "/images/400/Bug.png" },
    { name: "Butterfly", classification: "Lepidoptera", pic_sm: "/images/60/Butterfly.png", pic_lg: "/images/400/Butterfly.png" },
    { name: "Cat", classification: "Felis", pic_sm: "/images/60/Cat.png", pic_lg: "/images/400/Cat.png" },
    { name: "Crab", classification: "Brachyura", pic_sm: "/images/60/Crab.png", pic_lg: "/images/400/Crab.png" },
    { name: "Crocodile", classification: "Crocodylidae", pic_sm: "/images/60/Crocodile.png", pic_lg: "/images/400/Crocodile.png" },
    { name: "Dog", classification: "Canis lupus", pic_sm: "/images/60/Dog.png", pic_lg: "/images/400/Dog.png" },
    { name: "Dolphin", classification: "Delphinidae", pic_sm: "/images/60/Dolphin.png", pic_lg: "/images/400/Dolphin.png" },
    { name: "Dove", classification: "Columbidae", pic_sm: "/images/60/Dove.png", pic_lg: "/images/400/Dove.png" },
    { name: "Duck", classification: "Anatidae", pic_sm: "/images/60/Duck.png", pic_lg: "/images/400/Duck.png" },
    { name: "Elephant", classification: "Elephantidae", pic_sm: "/images/60/Elephant.png", pic_lg: "/images/400/Elephant.png" },
    { name: "Fish", classification: "Salvelinus", pic_sm: "/images/60/Fish.png", pic_lg: "/images/400/Fish.png" },
    { name: "Fly", classification: "Diptera", pic_sm: "/images/60/Fly.png", pic_lg: "/images/400/Fly.png" },
    { name: "Giraffe", classification: "Giraffa camelopardalis", pic_sm: "/images/60/Giraffe.png", pic_lg: "/images/400/Giraffe.png" },
    { name: "Goat", classification: "Capra aegagrus hircus", pic_sm: "/images/60/Goat.png", pic_lg: "/images/400/Goat.png" },
    { name: "Hen", classification: "Gallus gallus domesticus", pic_sm: "/images/60/Hen.png", pic_lg: "/images/400/Hen.png" },
    { name: "Horse", classification: "Equus ferus caballus", pic_sm: "/images/60/Horse.png", pic_lg: "/images/400/Horse.png" },
    { name: "Jelly Fish", classification: "Cyanea capillata", pic_sm: "/images/60/Jelly Fish.png", pic_lg: "/images/400/Jelly Fish.png" },
    { name: "Lion", classification: "Panthera leo", pic_sm: "/images/60/Lion.png", pic_lg: "/images/400/Lion.png" },
    { name: "Monkey", classification: "Macaca", pic_sm: "/images/60/Monkey.png", pic_lg: "/images/400/Monkey.png" },
    { name: "Octopus", classification: "Octopoda", pic_sm: "/images/60/Octopus.png", pic_lg: "/images/400/Octopus.png" },
    { name: "Owl", classification: "Strigiformes", pic_sm: "/images/60/Owl.png", pic_lg: "/images/400/Owl.png" },
    { name: "Peacock", classification: "Pavo", pic_sm: "/images/60/Peacock.png", pic_lg: "/images/400/Peacock.png" },
    { name: "Penguin", classification: "Spheniscidae", pic_sm: "/images/60/Penguin.png", pic_lg: "/images/400/Penguin.png" },
    { name: "Pig", classification: "Sus", pic_sm: "/images/60/Pig.png", pic_lg: "/images/400/Pig.png" },
    { name: "Rabbit", classification: "Leporidae", pic_sm: "/images/60/Rabbit.png", pic_lg: "/images/400/Rabbit.png" },
    { name: "Rat", classification: "Rattus", pic_sm: "/images/60/Rat.png", pic_lg: "/images/400/Rat.png" },
    { name: "Snake", classification: "Serpentes", pic_sm: "/images/60/Snake.png", pic_lg: "/images/400/Snake.png" },
    { name: "Squirrel", classification: "Sciuridae", pic_sm: "/images/60/Squirrel.png", pic_lg: "/images/400/Squirrel.png" },
    { name: "Turtle", classification: "Chelonii", pic_sm: "/images/60/Turtle.png", pic_lg: "/images/400/Turtle.png" }
]);

function compareGroups(left, right) {
    return left.toUpperCase().charCodeAt(0) - right.toUpperCase().charCodeAt(0);
}

function getGroupKey(dataItem) {
    return dataItem.name.toUpperCase().charAt(0);
}

function getGroupData(dataItem) {
    return {
        name: dataItem.name.toUpperCase().charAt(0)
    };
}

var groupedAnimals = animals.createGrouped(getGroupKey, getGroupData, compareGroups);
