const object = [
    {
        "category": "Entertainment: Video Games",
        "type": "multiple",
        "difficulty": "easy",
        "question": "What was the first video game in the Batman &quot;Arkham&quot; series?",
        "correct_answer": "Arkham Asylum",
        "incorrect_answers": [
            "Arkham Knight",
            "Arkham City",
            "Arkham Origins"
        ]
    },
    {
        "category": "Entertainment: Video Games",
        "type": "multiple",
        "difficulty": "medium",
        "question": "The city of Rockport is featured in which of the following video games?",
        "correct_answer": "Need for Speed: Most Wanted (2005)",
        "incorrect_answers": [
            "Infamous 2",
            "Saints Row: The Third",
            "Burnout Revenge"
        ]
    },
    {
        "category": "Entertainment: Video Games",
        "type": "multiple",
        "difficulty": "medium",
        "question": "In Forza Motorsport 6, which of these track-exclusive cars was NOT featured in the game, either originally with the game or added as DLC?",
        "correct_answer": "Aston Martin Vulcan",
        "incorrect_answers": [
            "Ferrari FXX-K",
            "McLaren P1 GTR",
            "Lotus E23"
        ]
    },
    {
        "category": "Entertainment: Video Games",
        "type": "multiple",
        "difficulty": "medium",
        "question": "In the game &quot;Cave Story,&quot; what is the character Balrog&#039;s catchphrase?",
        "correct_answer": "Huzzah!",
        "incorrect_answers": [
            "Yes!",
            "Whoa there!",
            "Nyeh heh heh!"
        ]
    },
    {
        "category": "Entertainment: Video Games",
        "type": "multiple",
        "difficulty": "easy",
        "question": "The starting pistol of the Terrorist team in a competitive match of Counter Strike: Global Offensive is what?",
        "correct_answer": "Glock-18",
        "incorrect_answers": [
            "Tec-9",
            "Desert Eagle",
            "Dual Berretas"
        ]
    },
    {
        "category": "Entertainment: Video Games",
        "type": "boolean",
        "difficulty": "medium",
        "question": "In Portal, the Companion Cube&#039;s ARE sentient.",
        "correct_answer": "True",
        "incorrect_answers": [
            "False"
        ]
    },
    {
        "category": "Entertainment: Video Games",
        "type": "multiple",
        "difficulty": "easy",
        "question": "Rincewind from the 1995 Discworld game was voiced by which member of Monty Python?",
        "correct_answer": "Eric Idle",
        "incorrect_answers": [
            "John Cleese",
            "Terry Gilliam",
            "Michael Palin"
        ]
    }
]

const o = { id: 900, name: "Entertainment: Video Games" };



function getDifficultyLevel(categoryObject, listOfQuestions) {
    const { id, name } = categoryObject;
    const finalQuizObject = { id, name, difficulty: { mixed: listOfQuestions, easy: [], medium: [], hard: [] } };
    listOfQuestions.forEach((quizObject => {
        finalQuizObject.difficulty[quizObject.difficulty].push(quizObject);
    }))
    return finalQuizObject;
}

const result = getDifficultyLevel(o, object)
console.log(result.difficulty.easy);

module.exports = { getDifficultyLevel };