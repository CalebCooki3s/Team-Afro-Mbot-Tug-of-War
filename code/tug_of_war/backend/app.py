from flask import Flask, render_template, request
import json

app = Flask(__name__)


# Load questions
with open("questions.json", "r") as file:
    questions = json.load(file)


# Game scores
scores = {
    "1": 0,
    "2": 0
}


# Current question
current_question = 0


# Robot position
robot_position = 0


@app.route("/")
def home():
    return render_template(
        "player.html",
        question=questions[current_question],
        scores=scores,
        robot_position=robot_position
    )


@app.route("/answer", methods=["POST"])
def answer():
    global current_question
    global robot_position

    player = request.form["player"]
    answer = request.form["answer"]

    question = questions[current_question]
    correct_answer = question["answer"]

    if answer == correct_answer:
        result = "Correct! ✅"
        scores[player] += 1

        # Move robot toward the player
        if player == "1":
            robot_position -= 1
        else:
            robot_position += 1

    else:
        result = "Wrong! ❌"

    print(
        f"Player {player} selected: {answer} - {result}"
    )

    # Move to the next question
    current_question += 1

    # Start over after the last question
    if current_question >= len(questions):
        current_question = 0

    return render_template(
        "player.html",
        question=questions[current_question],
        result=result,
        scores=scores,
        robot_position=robot_position
    )


if __name__ == "__main__":
    app.run(debug=True)