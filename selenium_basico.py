from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


URL = "http://localhost:8000/index.html"


def prueba_carga_pagina():
    driver = webdriver.Chrome()
    driver.maximize_window()

    try:
        driver.get(URL)

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "clima"))
        )

        print("Prueba Selenium basica")
        print(f"URL evaluada: {URL}")
        print(f"Titulo de la pagina: {driver.title}")

        driver.find_element(By.ID, "name").send_keys("Esmaylin")
        driver.find_element(By.ID, "email").send_keys("esmaylin@example.com")
        driver.find_element(By.ID, "subscribe-btn").click()

        mensaje = WebDriverWait(driver, 10).until(
            EC.text_to_be_present_in_element(
                (By.ID, "form-message"),
                "Tu suscripcion fue guardada correctamente"
            )
        )

        if mensaje:
            print("Resultado: la pagina cargo y la suscripcion funciona.")
        else:
            print("Resultado: la pagina cargo, pero la suscripcion no fue confirmada.")

        driver.find_element(By.ID, "cancel-subscription-btn").click()

        cancelacion = WebDriverWait(driver, 10).until(
            EC.text_to_be_present_in_element(
                (By.ID, "form-message"),
                "Tu suscripcion fue cancelada correctamente"
            )
        )

        if cancelacion:
            print("Resultado: la cancelacion de suscripcion funciona.")
        else:
            print("Resultado: no se confirmo la cancelacion.")

    finally:
        driver.quit()


if __name__ == "__main__":
    prueba_carga_pagina()
