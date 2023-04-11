(function() { //IIFE

    let DB;

    const form = document.querySelector('#formulario');
    const enviarBtn = form.lastElementChild;
    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const telInput = document.getElementById('telefono');
    const empresaInput = document.getElementById('empresa');

    let clienteObj = {nombre: '', email: '', telefono: '', empresa: ''};
    let queryString;

    window.onload = () => {
        conectarDB();
        enviarBtn.value = 'Editar Cliente';
    }

    (function eventListeners() {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            guardarObj();
        });
        nombreInput.addEventListener('blur', () => {
            validarCampos(nombreInput);
        });
        emailInput.addEventListener('blur', () => {
            validarCampos(emailInput);
        });
        telInput.addEventListener('blur', () => {
            validarCampos(telInput);
        });
        empresaInput.addEventListener('blur', () => {
            validarCampos(empresaInput);
        });
    })();

    function conectarDB() {
        const crearDB = indexedDB.open('clientesDB', 1); //Nombre citas, ver. 1

        crearDB.onerror = () => console.log('Error en la DB');

        crearDB.onsuccess = () => {
            console.log('DB creada');
            DB = crearDB.result;
            cargarEdicion();
        }
    }

    function validarCampos(campo) {
        const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        const telArgRegex = /^((\+54\s?)?(\s?9\s?)?\d{2,3}[\s-]?\d{3,4}-?\d{3,4}|\d{10,11}|(\d{3,4}[\s-]){1,2}\d{3,4})$/;
        
        let resultado = campo.value != '' ? true : false;
        let emailExiste = false;
        
        enviarBtn.disabled = true;
        enviarBtn.classList.add('cursor-not-allowed', 'opacity-50');

        //Primero traer email para chequear en DB si se repite
        const tx = DB.transaction('clientes', 'readwrite');
        const store = tx.objectStore('clientes');

        let consulta = store.get(emailInput.value);

        tx.oncomplete = () => { //Al tenerlo disponible, ejecutar las demás verificaciones
            //Alternador en email
            if(campo.type === "email"){
                resultado = emailRegex.test(campo.value)

                if (consulta.result !== undefined) {
                    emailExiste = campo.value === consulta.result.email ? 
                    campo.value === clienteObj.email ? false : true :
                    false;
                }
            }
            //Alternador en telefono
            if(campo.type === "tel"){
                resultado = telArgRegex.test(campo.value);
            }
            //Validacion campos
            if(!resultado || emailExiste) {
                campo.classList.add('border', 'border-red-500'); //TailwindCSS
                
                mostrarAlerta(
                    campo.type === "email" ?
                    emailExiste ? 'Email existente' :
                    'Email no valido' :
                    campo.type === "tel" ? 'Telefono no valido' :
                    'Todos los campos son obligatorios.'
                );
                return;
            }

            campo.classList.remove('border-red-500'); //TailwindCSS

            //Validacion total
            if(nombreInput.value != '' && emailRegex.test(emailInput.value) && telArgRegex.test(telInput.value) && empresaInput.value != '') {
                enviarBtn.disabled = false;
                enviarBtn.classList.remove('cursor-not-allowed', 'opacity-50');
                console.log('validada');
            }
        }
    }
    function mostrarAlerta(error, tipo) {
        const err = document.createElement('div');
        const previous = form.querySelector('.alert');
        const contenedor = form

        err.textContent = error;
        err.className = ('alert px-4 py-3 m-2 rounded text-center max-w-lg mx-auto mt-6 text-center border');
        
        tipo === 'correcto' ?
        err.classList.add('bg-green-100', 'text-green-700', 'border-green-500')
        :
        err.classList.add('bg-red-100', 'text-red-700', 'border-red-500') ;
        
        if (previous != null) { 
            contenedor.removeChild(previous);
            contenedor.insertBefore(err, contenedor.firstChild);

            setTimeout(() => {
                contenedor.removeChild(err);
            }, 2000);
        } else {
            contenedor.insertBefore(err, contenedor.firstChild);

            setTimeout(() => {
                contenedor.removeChild(err);
            }, 2000);
        }
    }

    function guardarObj() {
        clienteObj.nombre = nombreInput.value;
        clienteObj.email = emailInput.value;
        clienteObj.telefono = telInput.value;
        clienteObj.empresa = empresaInput.value;

        const tx = DB.transaction('clientes', 'readwrite');
        const store = tx.objectStore('clientes');

        if(emailInput.value != queryString) { //Borrar anterior si cambia el email.
            store.delete(queryString);
        }
        store.put(clienteObj);

        tx.onerror = () => {
            mostrarAlerta('Hubo un error. Intentar nuevamente.');
        }

        tx.oncomplete = () => {
            mostrarAlerta('Cliente editado correctamente.', 'correcto');
            setTimeout(() => {
                location.href = "http://127.0.0.1:5500/32-PROYECTO-CRMIndexedDB/index.html"
            }, 2000);
        }
    }

    function cargarEdicion() {
        /* Mi metodo
        queryString = location.search;
        queryString = queryString.replace(/^\?.+?%22|(%22)/g, '');
        */

        const params = new URLSearchParams(location.search);
        queryString = params.get('id');
        
        if(queryString) {
            const tx = DB.transaction('clientes', 'readwrite');
            const store = tx.objectStore('clientes');

            let consulta = store.get(queryString);

            tx.oncomplete = () => {
                clienteObj = consulta.result;

                nombreInput.value = clienteObj.nombre;
                emailInput.value = clienteObj.email;
                telInput.value = clienteObj.telefono;
                empresaInput.value = clienteObj.empresa;
            }
        }
    }
    
})(); //Fin de IIFE