function openModal(id){
  document.getElementById(id).style.display = "flex";
}

//close event
document.querySelectorAll(".modal").forEach(modal => {
  modal.addEventListener("click", event => {
    modal.style.display = "none";
  });
});