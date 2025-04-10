let currentIndex = 0;
const pictures = document.querySelectorAll(".slide picture");
const totalPictures = pictures.length;
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

function showSlide(index) {
    pictures.forEach(picture => picture.classList.remove("active"));
    pictures[index].classList.add("active");
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % totalPictures;
    showSlide(currentIndex);
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + totalPictures) % totalPictures;
    showSlide(currentIndex);
}

nextBtn.addEventListener("click", () => {
    nextSlide();
    resetTimer();
});

prevBtn.addEventListener("click", () => {
    prevSlide();
    resetTimer();
});

let autoSlide = setInterval(nextSlide, 6000);

function resetTimer() {
    clearInterval(autoSlide);
    autoSlide = setInterval(nextSlide, 6000);
}


document.addEventListener("DOMContentLoaded", () => {
    user = JSON.parse(localStorage.getItem('user')) || null;
    const adminMenu = document.querySelector("nav ul li a[href='#']");
    const loginLink = document.querySelector("nav ul li a[href='Login.html']");
    const formRegistro = document.getElementById("nuevoRegistro");
    if (user && user.rol === "Administrador") {
        adminMenu.parentElement.style.display = "block";
        loginLink.textContent = "Cerrar Sesión";
        loginLink.setAttribute("href", "Login.html");
        formRegistro.parentElement.style.visibility = "hidden";
    } else {
        adminMenu.parentElement.style.display = "none";
        formRegistro.parentElement.style.visibility = "visible";
        loginLink.textContent = "Iniciar Sesión";
        loginLink.setAttribute("href", "Login.html");
        
    }
});