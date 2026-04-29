from pathlib import Path
import csv
import pickle

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.multiclass import OneVsRestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.linear_model import LogisticRegression


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset.csv"
MODEL_PATH = BASE_DIR / "criteria_model.pkl"


def load_dataset():
    decisions = []
    criteria_labels = []

    with DATASET_PATH.open(newline="", encoding="utf-8") as dataset_file:
        reader = csv.DictReader(dataset_file)
        for row in reader:
            decisions.append(row["decision"])
            criteria_labels.append(row["criteria"].split("|"))

    return decisions, criteria_labels


def train_and_save_model():
    decisions, criteria_labels = load_dataset()

    label_binarizer = MultiLabelBinarizer()
    encoded_labels = label_binarizer.fit_transform(criteria_labels)

    pipeline = Pipeline(
        steps=[
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
            (
                "classifier",
                OneVsRestClassifier(
                    LogisticRegression(max_iter=1000, random_state=42)
                ),
            ),
        ]
    )

    pipeline.fit(decisions, encoded_labels)

    with MODEL_PATH.open("wb") as model_file:
        pickle.dump(
            {
                "pipeline": pipeline,
                "label_binarizer": label_binarizer,
            },
            model_file,
        )

    print(f"Saved model to {MODEL_PATH}")


if __name__ == "__main__":
    train_and_save_model()
