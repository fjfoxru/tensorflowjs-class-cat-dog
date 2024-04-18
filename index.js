import * as tf from '@tensorflow/tfjs';
import * as ui from './ui';

const IMAGE_SIZE = 100;
const TOPK_PREDICTIONS = 2;
const CLASSES = {
  0: "Кот",
  1: "Собака",
}


/** Предсказать */
async function predict(imgElement) {
  const model = await tf.loadLayersModel('model/model.json');
  // model.summary();
  const logits = tf.tidy(() => {
    const img = tf.cast(tf.browser.fromPixels(imgElement), 'float32');    
    const gray = tf.image.rgbToGrayscale(img)
    const resizedImageTensor = tf.image.resizeBilinear(gray, [28, 28]);
    const batched = resizedImageTensor.reshape([1, 28, 28, 1]);
    return model.predict(batched);
  });

  const classes = await getTopKClasses(logits, TOPK_PREDICTIONS);
  console.log(classes)
}

/** Нажатие на кнопку */
ui.setTrainButtonCallback(async () => {
  const catElement = document.getElementById('cat');
  predict(catElement)
});


const filesElement = document.getElementById('files');
filesElement.addEventListener('change', evt => {
  let files = evt.target.files;
  // Display thumbnails & issue call to predict each image.
  for (let i = 0, f; f = files[i]; i++) {
    // Only process image files (skip non image files)
    if (!f.type.match('image.*')) {
      continue;
    }
    let reader = new FileReader();
    reader.onload = e => {
      // Fill the image & call predict.
      let img = document.createElement('img');
      img.src = e.target.result;
      img.width = IMAGE_SIZE;
      img.height = IMAGE_SIZE;
      img.onload = () => predict(img);
    };

    // Read in the image file as a data URL.
    reader.readAsDataURL(f);
  }
});


/** Самые вероятные классы */
export async function getTopKClasses(logits, topK) {
  const values = await logits.data();

  const valuesAndIndices = [];
  for (let i = 0; i < values.length; i++) {
    valuesAndIndices.push({value: values[i], index: i});
  }
  valuesAndIndices.sort((a, b) => {
    return b.value - a.value;
  });
  const topkValues = new Float32Array(topK);
  const topkIndices = new Int32Array(topK);
  for (let i = 0; i < topK; i++) {
    topkValues[i] = valuesAndIndices[i].value;
    topkIndices[i] = valuesAndIndices[i].index;
  }

  const topClassesAndProbs = [];
  for (let i = 0; i < topkIndices.length; i++) {
    topClassesAndProbs.push({
      className: CLASSES[topkIndices[i]],
      probability: topkValues[i]
    })
  }
  // return topClassesAndProbs;
  const tg = window.Telegram.WebApp;
  const data = JSON.stringify(topClassesAndProbs[0].className);
  tg.sendData(data);
  tg.close();
  return topClassesAndProbs[0].className
}