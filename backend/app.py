import base64
from io import BytesIO
from flask import Flask, jsonify, request
import fastf1 as ff1
import matplotlib
matplotlib.use('Agg')
from matplotlib import pyplot as plt
from flask_cors import CORS 
import pandas as pd
import numpy as np
from matplotlib.collections import LineCollection

app = Flask(__name__)
CORS(app)
@app.route('/get-options', methods=['GET'])
def get_options():
    return jsonify({
        'years': [2021, 2020, 2019],
        'drivers': ['VER', 'HAM', 'LEC', 'BOT'],
        'tracks': ['Abu Dhabi', 'Monza', 'Silverstone']
    })

@app.route('/generate-image', methods=['POST'])
def generate_image():
    data = request.json
    year = data['year']
    driver1 = data['driver1']
    driver2 = data['driver2']
    track = data['track']

    try:
        session = ff1.get_session(int(year), track, 'Q')
        session.load()

        laps_driver1 = session.laps.pick_driver(driver1)
        laps_driver2 = session.laps.pick_driver(driver2)

        telemetry_driver1 = laps_driver1.pick_fastest().get_telemetry().add_distance()
        telemetry_driver2 = laps_driver2.pick_fastest().get_telemetry().add_distance()

        telemetry_driver1['Driver'] = driver1
        telemetry_driver2['Driver'] = driver2

        telemetry = pd.concat([telemetry_driver1, telemetry_driver2])

        num_minisectors = 25

        total_distance = max(telemetry['Distance'])

        minisector_length = total_distance / num_minisectors

        minisectors = [0]

        for i in range(0, (num_minisectors - 1)):
            minisectors.append(minisector_length * (i + 1))

        telemetry['Minisector'] = telemetry['Distance'].apply(
            lambda dist: (
                int((dist // minisector_length) + 1)
            )   
        )   

        average_speed = telemetry.groupby(['Minisector', 'Driver'])['Speed'].mean().reset_index()

        fastest_driver = average_speed.loc[average_speed.groupby(['Minisector'])['Speed'].idxmax()]

        fastest_driver = fastest_driver[['Minisector', 'Driver']].rename(columns={'Driver': 'Fastest_driver'})

        telemetry = telemetry.merge(fastest_driver, on='Minisector')

        telemetry['Fastest_driver_int'] = telemetry['Fastest_driver'].apply(lambda x: 1 if x == driver1 else 2)

        x = np.array(telemetry['X'].values)
        y = np.array(telemetry['Y'].values)

        points = np.array([x, y]).T.reshape(-1, 1, 2)
        segments = np.concatenate([points[:-1], points[1:]], axis=1)
        fastest_driver_array = telemetry['Fastest_driver_int'].to_numpy().astype(float)
        plt.figure(facecolor='#100C08')
        cmap = plt.get_cmap('winter', 2)  # Use plt.get_cmap instead of cm.get_cmap
        lc_comp = LineCollection(segments, norm=plt.Normalize(1, cmap.N+1), cmap=cmap)
        lc_comp.set_array(fastest_driver_array)
        lc_comp.set_linewidth(5)

        plt.rcParams['figure.figsize'] = [18, 10]

        plt.gca().add_collection(lc_comp)
        plt.axis('equal')
        plt.tick_params(labelleft=False, left=False, labelbottom=False, bottom=False)

        cbar = plt.colorbar(mappable=lc_comp, boundaries=np.arange(1,4))
        cbar.set_ticks([1.5, 2.5])
        cbar.set_ticklabels([driver1, driver2])

        img = BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close()

        img_base64 = base64.b64encode(img.getvalue()).decode('utf-8')

        return jsonify({'image': img_base64})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, threaded=False)
