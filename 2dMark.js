// author wudong
// date 20190912
// 

// 北京市
// 经度：116.40 
// 纬度：39.90
// 经度：116.50
// 纬度：40.90

//山东省 烟台市 烟台市
// 经度：121.43 
// 纬度：37.45

// 山西省 吕梁市 交城县
// 经度：112.15 
// 纬度：37.55

// 山东临沂
// 34.5，118.5

function mark_2d(view, dir_path, scene) {

    positionArr = [[116.40, 39.90], [116.70, 40.20], [121.43, 37.45], [112.15, 37.55], [118.5, 34.5]];
    str_text = ["栋哥", "栋哥的姐姐", "琦宝", "栋哥的爸妈", "琦宝的爸妈"];
    image_path = "data/love.png";
    // add mark
    for (i = 0; i < 5; i++) {
        add_2d_mark(view, positionArr[i], str_text[i], image_path);
    }
    // add flower
    for (i = 0; i < 11; i++) {
        ran = Math.random() - 0.5;
        a = 121.43 + ran;
        ran = Math.random() - 0.5;
        b = 37.45 + ran;
        add_flower(view, [a, b]);
    }
    // add line
    add_line(view, [116.40, 39.90, 116.70, 40.20]);
    add_line(view, [116.40, 39.90, 121.43, 37.45]);
    add_line(view, [116.40, 39.90, 112.15, 37.55]);
    add_line(view, [116.40, 39.90, 118.5, 34.5]);

    add_line(view, [116.70, 40.20, 121.43, 37.45]);
    add_line(view, [116.70, 40.20, 112.15, 37.55]);
    add_line(view, [116.70, 40.20, 118.5, 34.5]);

    add_line(view, [121.43, 37.45, 112.15, 37.55]);
    add_line(view, [121.43, 37.45, 118.5, 34.5]);

    add_line(view, [112.15, 37.55, 118.5, 34.5]);

    // add 3d model
    var redSphere = view.entities.add({
        name : 'Red sphere with black outline',
        position: Cesium.Cartesian3.fromDegrees(119.30, 37.90, 650000.0),
        ellipsoid : {
            radii : new Cesium.Cartesian3(100000.0, 100000.0, 100000.0),
            material : 'data/moon.jpg',
            outline : false
        }
    });
    

    // set init view
    view.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(116.5, 24.7, 1300000.0),
        orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-38.0),
            roll: 0.0
        }
    });

}


function add_2d_mark(viewer, positionArr, str_text) {
    height = 100;
    var mark = viewer.entities.add({
        name: ' mark',
        position: Cesium.Cartesian3.fromDegrees(positionArr[0], positionArr[1], height),
        billboard: {
            image: image_path,
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
            show: true,
            showBackground: true,
            font: '20px monospace',
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            text: str_text,
            pixelOffset: new Cesium.Cartesian2(15.0, 0.0)

        },
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([positionArr[0], positionArr[1], height,
            positionArr[0], positionArr[1], 0]),
            width: 2,
            material: new Cesium.PolylineOutlineMaterialProperty({
                color: Cesium.Color.YELLOW,
                outlineWidth: 0,
            })
        }
    });
    // view.zoomTo(point);
}

function add_line(viewer, positionArr) {
    /*
         流纹纹理线
         color 颜色
         duration 持续时间 毫秒
      */
    function PolylineTrailLinkMaterialProperty(color, duration) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;
        this.color = color;
        this.duration = duration;
        this._time = (new Date()).getTime();
    }
    Cesium.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
        isConstant: {
            get: function () {
                return false;
            }
        },
        definitionChanged: {
            get: function () {
                return this._definitionChanged;
            }
        },
        color: Cesium.createPropertyDescriptor('color')
    });
    PolylineTrailLinkMaterialProperty.prototype.getType = function (time) {
        return 'PolylineTrailLink';
    }
    PolylineTrailLinkMaterialProperty.prototype.getValue = function (time, result) {
        if (!Cesium.defined(result)) {
            result = {};
        }
        result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
        result.image = Cesium.Material.PolylineTrailLinkImage;
        result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
        return result;
    }
    PolylineTrailLinkMaterialProperty.prototype.equals = function (other) {
        return this === other ||
            (other instanceof PolylineTrailLinkMaterialProperty &&
                Cesium.Property.equals(this._color, other._color))
    }
    Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty;
    Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink';
    Cesium.Material.PolylineTrailLinkImage = "data/colors.png";
    Cesium.Material.PolylineTrailLinkSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                                  {\n\
                                                       czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                                       vec2 st = materialInput.st;\n\
                                                       vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
                                                       material.alpha = colorImage.a * color.a;\n\
                                                       material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                                                       return material;\n\
                                                   }";
    Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
        fabric: {
            type: Cesium.Material.PolylineTrailLinkType,
            uniforms: {
                color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
                image: Cesium.Material.PolylineTrailLinkImage,
                time: 0
            },
            source: Cesium.Material.PolylineTrailLinkSource
        },
        translucent: function (material) {
            return true;
        }
    });
    material = new Cesium.PolylineTrailLinkMaterialProperty(Cesium.Color.ORANGE, 1000);
    var glowingLine = viewer.entities.add({
        name: 'Glowing blue line on the surface',
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray([positionArr[0], positionArr[1],
            positionArr[2], positionArr[3]]),
            width: 10,
            material: material
        }
    });

}

function add_flower(viewer, positionArr) {
    height = 100;
    var mark = viewer.entities.add({
        name: ' mark',
        position: Cesium.Cartesian3.fromDegrees(positionArr[0], positionArr[1], height),
        billboard: {
            image: "data/flower_map.png",
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([positionArr[0], positionArr[1], height,
            positionArr[0], positionArr[1], 0]),
            width: 2,
            material: new Cesium.PolylineOutlineMaterialProperty({
                color: Cesium.Color.YELLOW,
                outlineWidth: 0,
            })
        }
    });
}

