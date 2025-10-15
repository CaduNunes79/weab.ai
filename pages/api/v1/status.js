function status(request, response) {
  response.status(200).json({ Chave: "Testado" });
}

export default status;
