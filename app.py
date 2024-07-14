from flask import Flask, render_template, request, jsonify,redirect,url_for
import psycopg2
import subprocess
import re

app = Flask(__name__)

def insert_buffered_points_into_table(selected_layer, new_table_name, buffer_radius):
    # Database connection parameters
    dbname = "trail"
    user = "postgres"
    password = "admin"
    host = "localhost"
    port = "5432"

    # Connect to the database
    conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host, port=port)
    cursor = conn.cursor()

    # Create a new table
    create_table_query = f"""
    CREATE TABLE IF NOT EXISTS {new_table_name} (
        gid serial PRIMARY KEY,
        geom geometry(Geometry, 32644)
    );
    """
    cursor.execute(create_table_query)

    # Run the SQL command for the selected layer and fetch data
    sql_query = f"""
    SELECT gid, ST_AsText(ST_Buffer(ST_Transform(geom, 32644), {buffer_radius})) AS geom FROM {selected_layer}
    """
    cursor.execute(sql_query)
    data_to_insert = cursor.fetchall()

    # Parse and insert data into the new table
    for row in data_to_insert:
        gid, geom_wkt = row
        insert_query = f"INSERT INTO {new_table_name} (gid, geom) VALUES (%s, ST_GeomFromText(%s, 32644))"
        cursor.execute(insert_query, (gid, geom_wkt))

    # Commit changes and close the connection
    conn.commit()
    cursor.close()
    conn.close()

    # return f"Data inserted into the {new_table_name} table."
    return render_template('index.html')

username = "admin"
password = "geoserver"
workspace = "test"
data_store = "postgres"
table_name = {"new_table_name"}

def publish_layer_to_geoserver(username, password, workspace, data_store, new_table_name):
    # Construct the cURL command
    curl_command = (
        f'curl -v -u {username}:{password} -XPOST -H "Content-type: text/xml" -d "<featureType><name>{new_table_name}</name></featureType>" http://127.0.0.1:8085/geoserver/rest/workspaces/{workspace}/datastores/{data_store}/featuretypes'
    )

    try:
        # Execute the cURL command using subprocess
        result = subprocess.run(curl_command, shell=True, capture_output=True, text=True, check=True)

        # Return the result (response) of the cURL command
        return result.stdout
    except subprocess.CalledProcessError as e:
        return f"Error executing cURL command: {e}"

def get_layers_from_database():
    # Database connection parameters
    dbname = "trail"
    user = "postgres"
    password = "admin"
    host = "localhost"
    port = "5432"


    # Connect to the database
    conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host, port=port)
    cursor = conn.cursor()

    # Fetch layer names from the database
    cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
    layer_names = [row[0] for row in cursor.fetchall()]
    # Close the connection
    cursor.close()
    conn.close()

    return layer_names



def buffer():
    if request.method == 'POST':
        selected_layer = request.form['selected_layer']
        new_table_name = request.form['new_table_name']
        buffer_radius = float(request.form['buffer_radius'])

        # Insert buffered points into the new table
        result_insert = insert_buffered_points_into_table(selected_layer, new_table_name, buffer_radius)
      
        # Publish the layer to GeoServer using the curl command
        result_publish = publish_layer_to_geoserver(username, password, workspace, data_store, new_table_name)

        return f"{result_insert}\n\n{result_publish}"

    layers = get_layers_from_database()
    return render_template('index.html', layers=layers)





@app.route('/short')
def goToShortPage():
    return render_template('short.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'fileInput' not in request.files:
        return jsonify({'error': 'No file part'})
    
    file = request.files['fileInput']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    
    # Read and parse the GeoJSON file
    try:
        geojson_data = file.read()
        # You may want to process the GeoJSON data here if necessary
        # For now, we'll simply return it to the client
        return jsonify({'geojson': geojson_data.decode('utf-8')})
    except Exception as e:
        return jsonify({'error': 'Failed to read GeoJSON file', 'details': str(e)})
    

@app.route('/upload_csv', methods=['POST'])
def upload_csv():
    if 'csvFileInput' not in request.files:
        return jsonify({'error': 'No file part'})
    
    file = request.files['csvFileInput']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    
    # Read and process the CSV file
    try:
        # You can implement CSV parsing and processing here
        # For now, we'll just return a success message
        return jsonify({'success': 'CSV file uploaded successfully'})
    except Exception as e:
        return jsonify({'error': 'Failed to process CSV file', 'details': str(e)})

@app.route('/query.html')
def query():
    return render_template('query.html')



conn = psycopg2.connect(
    dbname="trail",
    user="postgres",
    password="admin",
    host="localhost",
    port="5432"
)
cur = conn.cursor()

# Create users table if it doesn't exist
cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE,
        password VARCHAR(100)
    )
""")
conn.commit()



@app.route('/', methods=['GET', 'POST'])



@app.route('/login', methods=['GET', 'POST'])
def login():
    error_message = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Fetch user data from the database
        cur.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, password))
        user = cur.fetchone()
        
        # Check if username and password match the admin credentials
        if username == 'admin' and password == 'db':
            # Redirect to admin dashboard
            return render_template('admin.html')
        # Check if user exists in the database
        elif user:
            # Redirect to user dashboard
            return render_template('index.html')
        else:
            error_message = "Invalid username or password. Please try again."
    return render_template('login.html', error_message=error_message)


@app.route('/admin_dashboard')
def admin_dashboard():
    return render_template('admin.html')

def home():
    return render_template('/index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Handle registration form submission
        username = request.form['username']
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        
        # Check if the username already exists in the database
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        existing_user = cur.fetchone()
        if existing_user:
            error_message = "Username already exists. Please choose a different username."
            return render_template('register.html', error_message=error_message)
        
        # Validate password constraints
        if not re.match(r'^(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}[\]:;<>,.?/~]).{8,}$', password):
            error_message = "Password must contain at least 8 characters, start with a capital letter, and include a special character."
            return render_template('register.html', error_message=error_message)
        
        # Check if passwords match
        if password != confirm_password:
            error_message = "Passwords do not match. Please try again."
            return render_template('register.html', error_message=error_message)
        
        # Insert the new user into the database
        cur.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, password))
        conn.commit()
        
        return render_template('login.html')  # Redirect to login page after registration
    else:
        # Render the registration form
        return render_template('register.html')




@app.route('/forgot_password')
def forgot_password():
    # Your forgot password logic here
    pass

@app.route('/reset_password')
def reset_password():
    return render_template('reset_password.html')


@app.route('/redirect_to_geoserver')
def redirect_to_geoserver():
    # Replace 'http://your-geoserver-url-here' with the URL of your GeoServer
    return redirect('http://localhost:8085/geoserver/web/?2')


@app.route('/reset_password', methods=['POST'])
def reset_password_post():
    if request.method == 'POST':
        username = request.form['username']
        new_password = request.form['new-password']
        
        # Validate password constraints
        if not re.match(r'^(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}[\]:;<>,.?/~]).{8,}$', new_password):
            error_message = "Password must contain at least 8 characters, start with a capital letter, and include a special character."
            return render_template('reset_password.html', error_message=error_message)
        
        # Update the user's password in the database
        cur.execute("UPDATE users SET password = %s WHERE username = %s", (new_password, username))
        conn.commit()
        
        # Redirect to login page after password reset
        return redirect(url_for('login'))



if __name__ == '__main__':
    app.run(debug=True, port=5500)