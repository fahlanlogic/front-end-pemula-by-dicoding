const books = [];
const RENDER_EVENT = "render-books";
const STORAGE_KEY = "myBooks";
const SAVED_EVENT = "save-books";

const isStorageExist = () => {
	if (typeof Storage === undefined) {
		return false;
	}
	return true;
};

const addBook = () => {
	const bookTitle = document.getElementById("inputBookTitle").value;
	const bookAuthor = document.getElementById("inputBookAuthor").value;
	const bookYear = document.getElementById("inputBookYear").value;
	const isCompleted = document.getElementById(
		"inputBookIsComplete"
	).checked;
	const newBook = bookObject(bookTitle, bookAuthor, bookYear, isCompleted);
	books.push(newBook);
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveBook();
};

const generateId = () => {
	return +new Date();
};
const bookObject = (title, author, year, isComplete = false) => {
	return {
		id: generateId(),
		title,
		author,
		year,
		isComplete,
	};
};

const saveBook = () => {
	if (isStorageExist()) {
		const parsedMyBooks = JSON.stringify(books);
		localStorage.setItem(STORAGE_KEY, parsedMyBooks);
		document.dispatchEvent(new Event(SAVED_EVENT));
	}
};

document.addEventListener(SAVED_EVENT, () => {
	console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener(RENDER_EVENT, () => {
	const completedBooks = document.getElementById("completeBookshelfList");
	completedBooks.innerHTML = "";
	const unCompleteBooks = document.getElementById(
		"unCompleteBookshelfList"
	);
	unCompleteBooks.innerHTML = "";

	for (const bookItem of books) {
		const bookElement = makeBook(bookItem);
		if (!bookItem.isComplete) {
			unCompleteBooks.append(bookElement);
		} else {
			completedBooks.append(bookElement);
		}
	}
});

const makeBook = bookObject => {
	const title = document.createElement("h3");
	title.innerHTML = bookObject.title;
	title.classList.add("book_title");
	const author = document.createElement("p");
	author.innerHTML = `Penulis: ${bookObject.author}`;
	const year = document.createElement("p");
	year.innerHTML = `Tahun: ${bookObject.year}`;
	const bookItem = document.createElement("div");
	bookItem.classList.add("book_item");
	bookItem.append(title, author, year);

	const action = document.createElement("div");
	action.classList.add("action");

	const container = document.createElement("article");
	container.classList.add("book_container");
	container.append(bookItem, action);

	if (bookObject.isComplete) {
		const undoButton = document.createElement("button");
		undoButton.innerText = "Belum selesai dibaca";
		undoButton.addEventListener("click", () => {
			undoBookFromCompleted(bookObject.id);
		});

		const removeButton = document.createElement("button");
		removeButton.innerText = "Hapus buku";
		removeButton.addEventListener("click", () => {
			removeBook(bookObject.id);
		});

		action.append(undoButton, removeButton);
	} else {
		const checkButton = document.createElement("button");
		checkButton.innerText = "Selesai dibaca";
		checkButton.addEventListener("click", () => {
			addBookToComplete(bookObject.id);
		});
		action.append(checkButton);
	}
	return container;
};

const resetForm = () => {
	document.getElementById("inputBookTitle").value = "";
	document.getElementById("inputBookAuthor").value = "";
	document.getElementById("inputBookYear").value = "";
	document.getElementById("inputBookIsComplete").value = "";
};

const loadBooks = () => {
	const serializedData = localStorage.getItem(STORAGE_KEY);
	let data = JSON.parse(serializedData);
	if (data !== null) {
		for (const book of data) [books.push(book)];
	}
	document.dispatchEvent(new Event(RENDER_EVENT));
};

const findBook = bookId => {
	for (const bookItem of books) {
		if (bookItem.id === bookId) {
			return bookItem;
		}
	}
	return null;
};

const findIndex = bookId => {
	for (const index in books) {
		if (books[index].id === bookId) {
			return index;
		}
	}
	return -1;
};

const addBookToComplete = bookId => {
	const bookTarget = findBook(bookId);
	if (bookTarget == null) return;
	bookTarget.isComplete = true;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveBook();
};

const undoBookFromCompleted = bookId => {
	const bookTarget = findBook(bookId);
	if (bookTarget == null) return;
	bookTarget.isComplete = false;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveBook();
};

const removeBook = bookId => {
	const bookTarget = findIndex(bookId);
	books.splice(bookTarget, 1);
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveBook();
};

const searchButton = document.getElementById("searchSubmit");

document.addEventListener("DOMContentLoaded", () => {
	const submit = document.getElementById("inputBook");
	submit.addEventListener("submit", event => {
		event.preventDefault();
		addBook();
		resetForm();
		console.log(books);
	});

	searchButton.addEventListener("click", event => {
		const titleKeyword =
			document.getElementById("searchBookTitle").value;
		const bookItems = document.querySelectorAll(".book_title");
		for (const bookItem of bookItems) {
			const bookTitle = bookItem.innerText;
			if (
				titleKeyword[0]
					.toLowerCase()
					.includes(bookTitle.toLowerCase())
			) {
				bookItem.removeAttribute("hidden");
			} else {
				bookItem.setAttribute("hidden");
			}
		}

		event.preventDefault();
	});

	if (isStorageExist()) {
		loadBooks();
	}
});