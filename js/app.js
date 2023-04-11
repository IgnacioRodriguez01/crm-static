let DB;
const lista = document.getElementById('listado-clientes');

window.onload = () => {
    crearDB();
}

function crearDB() {
    const crearDB = indexedDB.open('clientesDB', 1); //Nombre citas, ver. 1

    crearDB.onerror = () => console.log('Error en la DB');

    crearDB.onsuccess = () => {
        console.log('DB creada');
        DB = crearDB.result;
        cargarClientes();
    }

    crearDB.onupgradeneeded = (e) => {
        const db = e.target.result;

        const objStore = db.createObjectStore('clientes', {
            keyPath: 'email',
            autoIncrement: true
        });

        //Definimos las "columnas"
        objStore.createIndex('nombre', 'nombre', {unique: false} );
        objStore.createIndex('telefono', 'telefono', {unique: false} );
        objStore.createIndex('empresa', 'empresa', {unique: false} );
        objStore.createIndex('acciones', 'acciones', {unique: false} );
        objStore.createIndex('email', 'email', {unique: true} ); //keyPath
    }
}

function cargarClientes() {
    const tx = DB.transaction('clientes', 'readwrite');
    const store = tx.objectStore('clientes');    
    
    limpiarHTML(lista);

    store.openCursor().onsuccess = (e) => { //Inicio del iterador del cursor
        let cursor = e.target.result;
        if(!cursor) { //Escape del iterador
            return;
        }
        
        mostrarCliente(cursor.value);
        
        cursor.continue();
    }
}

function mostrarCliente(cliente) {
    lista.innerHTML += `
        <tr>
            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <p class="text-sm leading-5 font-medium text-gray-700 text-lg  font-bold"> ${cliente.nombre} </p>
                <p class="text-sm leading-10 text-gray-700"> ${cliente.email} </p>
            </td>
            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 ">
                <p class="text-gray-700">${cliente.telefono}</p>
            </td>
            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200  leading-5 text-gray-700">    
                <p class="text-gray-600">${cliente.empresa}</p>
            </td>
            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5">
                <a href="editar-cliente.html?id=${cliente.email}" class="text-teal-600 hover:text-teal-900 mr-5">Editar</a>
                <a href="#" data-id="${cliente.email}" class="text-red-600 hover:text-red-900 borrar">Eliminar</a>
            </td>
        </tr>
    `;

    //Aqui tambien se podria agregar un eventlistener a lista, y con delegation chequear solo .borrar
    const borrarBtn = lista.querySelector('.borrar')
    borrarBtn.onclick = (e) => {
        borrarCliente(e.target);
    }
    
    /* Mi primer version
    const row = document.createElement('tr');
    
    const colNombre = document.createElement('td');
    colNombre.className = "px-6 py-3 border-b border-gray-200 text-xs font-bold leading-4 font-medium text-gray-600 tracking-wider"
    colNombre.textContent = cliente.nombre
    
    const colTelefono = document.createElement('td');
    colTelefono.className = "px-6 py-3 border-b border-gray-200 text-xs font-bold leading-4 font-medium text-gray-600 tracking-wider"
    colTelefono.textContent = cliente.telefono
    
    const colEmpresa = document.createElement('td');
    colEmpresa.className = "px-6 py-3 border-b border-gray-200 text-xs font-bold leading-4 font-medium text-gray-600 tracking-wider"
    colEmpresa.textContent = cliente.empresa
    
    const colAcciones = document.createElement('td');
    colAcciones.className = "px-6 py-3 border-b border-gray-200 text-center text-xs leading-4 font-medium text-gray-600 tracking-wider"
    
    const borrarBtn = document.createElement('a');
    borrarBtn.dataid = cliente.email;
    borrarBtn.textContent = 'Borrar';
    borrarBtn.className = 'text-teal-600 hover:text-teal-900 mr-5'
    borrarBtn.style.cursor = 'pointer';

    const editarBtn = document.createElement('a');
    editarBtn.textContent = 'Editar';
    editarBtn.className = 'text-red-600 hover:text-red-900'
    editarBtn.href = `editar-cliente.html?id='${cliente.email}'`
    editarBtn.style.cursor = 'pointer';
    //editarBtn.onclick = () => {
    //    location.href = `http://127.0.0.1:5500/32-PROYECTO-CRMIndexedDB/editar-cliente.html?id="${cliente.email}"` //Mandando la info a traves de un query string en la URL
    //}

    row.appendChild(colNombre);
    row.appendChild(colTelefono);
    row.appendChild(colEmpresa);
    colAcciones.appendChild(borrarBtn);
    colAcciones.appendChild(editarBtn);
    row.appendChild(colAcciones);
    lista.appendChild(row);
    */
}

function borrarCliente(cliente) {
    const dataid = cliente.getAttribute('data-id');
    //const dataid = cliente.dataset.id; Otra anera de obtener valores data

    const confirmar = confirm('Deseas eliminar este cliente?');
    //Se podrian usar librearias como sweetalert, en vez de confirm

    if (confirmar) {
        const tx = DB.transaction('clientes', 'readwrite');
        const store = tx.objectStore('clientes'); 
        
        store.delete(dataid);

        cargarClientes();
    }
    
}

function limpiarHTML(contenedor) {
    while (contenedor.firstChild) {
        contenedor.removeChild(contenedor.firstChild);
    }
}