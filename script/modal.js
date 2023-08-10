function openModal(id){
  document.getElementById(id).style.display = "flex";
}

//close event
document.querySelectorAll(".modal").forEach(modal => {
  modal.addEventListener("click", event => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});