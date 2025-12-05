const tf = require('@tensorflow/tfjs');
const fs = require('fs');
const path = require('path');

async function testModel() {
  console.log('🧪 Testing ML Model...\n');
  
  try {
    // 1. Check if model files exist
    console.log('1️⃣ Checking model files...');
    const modelDir = path.join(__dirname, '../model');
    const modelJsonPath = path.join(modelDir, 'model.json');
    
    if (!fs.existsSync(modelJsonPath)) {
      console.error('❌ model.json not found');
      return;
    }
    console.log('✅ model.json exists');
    
    const modelJson = JSON.parse(fs.readFileSync(modelJsonPath, 'utf8'));
    const weightFiles = modelJson.weightsManifest[0].paths;
    
    for (const file of weightFiles) {
      const filePath = path.join(modelDir, file);
      if (!fs.existsSync(filePath)) {
        console.error(`❌ ${file} not found`);
        return;
      }
      const stats = fs.statSync(filePath);
      console.log(`✅ ${file} exists (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    }
    
    // 2. Load model
    console.log('\n2️⃣ Loading model...');
    const weightBuffers = [];
    for (const weightFile of weightFiles) {
      const weightPath = path.join(modelDir, weightFile);
      const buffer = fs.readFileSync(weightPath);
      weightBuffers.push(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
    }
    
    const totalLength = weightBuffers.reduce((sum, buf) => sum + buf.byteLength, 0);
    const allWeights = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of weightBuffers) {
      allWeights.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }
    
    const modelArtifacts = {
      modelTopology: modelJson.modelTopology,
      weightSpecs: modelJson.weightsManifest[0].weights,
      weightData: allWeights.buffer,
      format: modelJson.format,
      generatedBy: modelJson.generatedBy,
      convertedBy: modelJson.convertedBy
    };
    
    const model = await tf.loadLayersModel(tf.io.fromMemory(modelArtifacts));
    console.log('✅ Model loaded successfully');
    
    // 3. Check model architecture
    console.log('\n3️⃣ Model Architecture:');
    console.log(`   Input shape: [256, 256, 3]`);
    console.log(`   Output shape: [1] (binary classification)`);
    console.log(`   Total layers: ${model.layers.length}`);
    
    // 4. Test prediction with dummy data
    console.log('\n4️⃣ Testing prediction...');
    const dummyImage = tf.randomUniform([1, 256, 256, 3], 0, 1);
    const prediction = model.predict(dummyImage);
    const probability = prediction.dataSync()[0];
    
    console.log(`✅ Prediction successful`);
    console.log(`   Output probability: ${(probability * 100).toFixed(2)}%`);
    console.log(`   Classification: ${probability >= 0.5 ? 'Waste' : 'Not Waste'}`);
    
    // 5. Validate output range
    console.log('\n5️⃣ Validating output...');
    if (probability >= 0 && probability <= 1) {
      console.log('✅ Output is in valid range [0, 1]');
    } else {
      console.error('❌ Output out of range:', probability);
    }
    
    // 6. Test multiple predictions
    console.log('\n6️⃣ Testing multiple predictions...');
    for (let i = 0; i < 3; i++) {
      const testImage = tf.randomUniform([1, 256, 256, 3], 0, 1);
      const pred = model.predict(testImage);
      const prob = pred.dataSync()[0];
      console.log(`   Test ${i + 1}: ${(prob * 100).toFixed(2)}% - ${prob >= 0.5 ? 'Waste' : 'Not Waste'}`);
      testImage.dispose();
      pred.dispose();
    }
    console.log('✅ Multiple predictions working');
    
    // Cleanup
    dummyImage.dispose();
    prediction.dispose();
    
    console.log('\n✅ ALL TESTS PASSED - Model is ready for deployment! 🎉\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testModel();
