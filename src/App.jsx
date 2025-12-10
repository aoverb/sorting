import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, RotateCw, Scissors } from 'lucide-react';

const SortVisualizer = () => {
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [sliceDirection, setSliceDirection] = useState('vertical');
  const [sliceCount, setSliceCount] = useState(20);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [audioRange, setAudioRange] = useState({ start: 0, end: 100 });
  const [sortAlgorithm, setSortAlgorithm] = useState('bubble');
  const [customAlgorithm, setCustomAlgorithm] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [sortSpeed, setSortSpeed] = useState(50);
  
  const [imageSlicesCache, setImageSlicesCache] = useState([]);
  const [audioSlicesCache, setAudioSlicesCache] = useState([]);
  const [currentIndices, setCurrentIndices] = useState([]);
  const [sortStepsIndices, setSortStepsIndices] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSorted, setIsSorted] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [isPlayingFinalAudio, setIsPlayingFinalAudio] = useState(false);
  
  const [showHighlight, setShowHighlight] = useState(true);
  const [showBorder, setShowBorder] = useState(false);
  const [highlightColor, setHighlightColor] = useState('#fbbf24');
  const [borderColor, setBorderColor] = useState('#3b82f6');
  const [borderWidth, setBorderWidth] = useState(2);
  const [animationScale, setAnimationScale] = useState(100);
  const [highlightedPositions, setHighlightedPositions] = useState([]);
  
  const audioContextRef = useRef(null);
  const currentSourceRef = useRef(null);
  const imageRef = useRef(null);
  const audioPlaybackRef = useRef({ isPlaying: false });
  const containerRef = useRef(null);
  const finalAudioSourcesRef = useRef([]);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const updateSize = () => {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      };
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          setImage(event.target.result);
          setCropArea({ x: 0, y: 0, width: 100, height: 100 });
          setIsImageLoaded(true);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
          setAudioBuffer(buffer);
          setAudioRange({ start: 0, end: buffer.duration });
          setAudio(URL.createObjectURL(file));
        } catch (error) {
          alert('音频文件解码失败,请尝试其他格式');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const createImageSlices = () => {
    if (!imageRef.current || !isImageLoaded) return [];
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    const cropX = (cropArea.x / 100) * img.width;
    const cropY = (cropArea.y / 100) * img.height;
    const cropW = (cropArea.width / 100) * img.width;
    const cropH = (cropArea.height / 100) * img.height;
    
    const maxWidth = containerSize.width - 40;
    const maxHeight = containerSize.height - 40;
    
    let displayWidth = cropW;
    let displayHeight = cropH;
    
    if (sliceDirection === 'vertical') {
      displayWidth = Math.min(cropW, maxWidth);
      displayHeight = (cropH * displayWidth) / cropW;
      if (displayHeight > maxHeight) {
        displayHeight = maxHeight;
        displayWidth = (cropW * displayHeight) / cropH;
      }
    } else {
      displayHeight = Math.min(cropH, maxHeight);
      displayWidth = (cropW * displayHeight) / cropH;
      if (displayWidth > maxWidth) {
        displayWidth = maxWidth;
        displayHeight = (cropH * displayWidth) / cropW;
      }
    }
    
    const sliceArray = [];
    
    if (sliceDirection === 'vertical') {
      const sliceWidth = Math.floor(cropW / sliceCount);
      const displaySliceWidth = displayWidth / sliceCount;
      canvas.width = sliceWidth;
      canvas.height = cropH;
      
      for (let i = 0; i < sliceCount; i++) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, cropX + i * sliceWidth, cropY, sliceWidth, cropH, 0, 0, sliceWidth, cropH);
        sliceArray.push({
          dataUrl: canvas.toDataURL('image/png'),
          displayWidth: displaySliceWidth,
          displayHeight: displayHeight
        });
      }
    } else {
      const sliceHeight = Math.floor(cropH / sliceCount);
      const displaySliceHeight = displayHeight / sliceCount;
      canvas.width = cropW;
      canvas.height = sliceHeight;
      
      for (let i = 0; i < sliceCount; i++) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, cropX, cropY + i * sliceHeight, cropW, sliceHeight, 0, 0, cropW, sliceHeight);
        sliceArray.push({
          dataUrl: canvas.toDataURL('image/png'),
          displayWidth: displayWidth,
          displayHeight: displaySliceHeight
        });
      }
    }
    
    return sliceArray;
  };

  const createAudioSlices = () => {
    if (!audioBuffer) return [];
    const startTime = audioRange.start;
    const endTime = audioRange.end;
    const duration = endTime - startTime;
    const sliceDuration = duration / sliceCount;
    
    const sliceArray = [];
    for (let i = 0; i < sliceCount; i++) {
      sliceArray.push({
        start: startTime + i * sliceDuration,
        duration: sliceDuration
      });
    }
    return sliceArray;
  };

  const playAudioSlice = (audioSliceInfo) => {
    if (!audioBuffer || !audioContextRef.current || !audioSliceInfo) {
      return;
    }
    
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {
        // 忽略停止错误
      }
    }
    
    const ctx = audioContextRef.current;
    // 确保音频上下文处于运行状态
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01);
    
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const actualStart = Math.max(0, Math.min(audioSliceInfo.start, audioBuffer.duration - 0.01));
    const maxDuration = audioBuffer.duration - actualStart;
    const actualDuration = Math.min(audioSliceInfo.duration, maxDuration);
    
    if (actualDuration > 0.01) {
      source.start(ctx.currentTime, actualStart, actualDuration);
      currentSourceRef.current = source;
    }
  };

  const playFinalAudio = () => {
    if (!audioBuffer || sortStepsIndices.length === 0 || audioSlicesCache.length === 0) return;
    stopFinalAudio();
    setIsPlayingFinalAudio(true);
    
    const ctx = audioContextRef.current;
    const finalIndices = sortStepsIndices[sortStepsIndices.length - 1];
    const now = ctx.currentTime;
    
    finalIndices.forEach((idx, position) => {
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      
      const audioSlice = audioSlicesCache[idx];
      const offset = position * audioSlice.duration;
      
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(1, now + offset);
      
      if (position === finalIndices.length - 1) {
        gainNode.gain.setValueAtTime(1, now + offset + audioSlice.duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + offset + audioSlice.duration);
      }
      
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const actualDuration = Math.min(audioSlice.duration, audioBuffer.duration - audioSlice.start);
      if (actualDuration > 0) {
        source.start(now + offset, audioSlice.start, actualDuration);
        finalAudioSourcesRef.current.push(source);
      }
      
      if (position === finalIndices.length - 1) {
        source.onended = () => setIsPlayingFinalAudio(false);
      }
    });
  };

  const stopFinalAudio = () => {
    finalAudioSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {}
    });
    finalAudioSourcesRef.current = [];
    setIsPlayingFinalAudio(false);
  };

  const bubbleSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);
    
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push([...arr]);
          highlights.push([j, j + 1]);
        }
      }
    }
    return { steps, highlights };
  };

  const radixSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];

    steps.push([...arr]);
    highlights.push([]);

    const getMax = (arr) => Math.max(...arr);

    // 计数排序按 digit 位处理
    const countingSort = (exp) => {
      const n = arr.length;
      const output = new Array(n).fill(0);
      const count = new Array(10).fill(0);

      // 统计某个位上的数字出现次数
      for (let i = 0; i < n; i++) {
        const digit = Math.floor(arr[i] / exp) % 10;
        count[digit]++;
      }

      // 前缀和
      for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
      }

      // 从右到左构建 output 数组（稳定性）
      for (let i = n - 1; i >= 0; i--) {
        const digit = Math.floor(arr[i] / exp) % 10;
        output[--count[digit]] = arr[i];
      }

      // 写回 arr，并记录变化
      for (let i = 0; i < n; i++) {
        const prev = arr[i];
        arr[i] = output[i];

        if (arr[i] !== prev) {
          steps.push([...arr]);
          highlights.push([i]); // 只标记位置变化
        }
      }
    };

    const maxVal = getMax(arr);

    // 对每一位进行计数排序
    for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
      countingSort(exp);
    }

    return { steps, highlights };
  };

  const mergeSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);

    const merge = (left, mid, right) => {
      const leftArr = arr.slice(left, mid + 1);
      const rightArr = arr.slice(mid + 1, right + 1);

      let i = 0, j = 0, k = left;

      while (i < leftArr.length && j < rightArr.length) {
        if (leftArr[i] <= rightArr[j]) {
          arr[k] = leftArr[i];
          i++;
        } else {
          arr[k] = rightArr[j];
          j++;
        }
        steps.push([...arr]);
        // 只高亮当前合并的位置
        highlights.push([k]);
        k++;
      }

      // 处理剩余元素 - 确保索引有效
      while (i < leftArr.length) {
        arr[k] = leftArr[i];
        steps.push([...arr]);
        highlights.push([k]);
        i++;
        k++;
      }

      while (j < rightArr.length) {
        arr[k] = rightArr[j];
        steps.push([...arr]);
        highlights.push([k]);
        j++;
        k++;
      }
    };

    const sort = (left, right) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        sort(left, mid);
        sort(mid + 1, right);
        merge(left, mid, right);
      }
    };

    sort(0, arr.length - 1);
    return { steps, highlights };
  };


  const quickSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);
    
    const partition = (low, high) => {
      const pivot = arr[high];
      let i = low - 1;
      
      for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
          i++;
          if (i !== j) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            steps.push([...arr]);
            highlights.push([i, j]);
          }
        }
      }
      if (i + 1 !== high) {
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        steps.push([...arr]);
        highlights.push([i + 1, high]);
      }
      return i + 1;
    };
    
    const sort = (low, high) => {
      if (low < high) {
        const pi = partition(low, high);
        sort(low, pi - 1);
        sort(pi + 1, high);
      }
    };
    
    sort(0, arr.length - 1);
    return { steps, highlights };
  };

  const insertionSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);
    
    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      let j = i - 1;
      
      while (j >= 0 && arr[j] > key) {
        arr[j + 1] = arr[j];
        j--;
        steps.push([...arr]);
        highlights.push([j + 1, j + 2]);
      }
      arr[j + 1] = key;
      if (j + 1 !== i) {
        steps.push([...arr]);
        highlights.push([j + 1]);
      }
    }
    return { steps, highlights };
  };

const selectionSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);

    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;

        for (let j = i + 1; j < n; j++) {
            steps.push([...arr]);
            highlights.push([j, minIdx]);
            
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
                steps.push([...arr]);
                highlights.push([minIdx]);
            }
        }

        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            steps.push([...arr]);
            highlights.push([i, minIdx]);
        } else {
            steps.push([...arr]);
            highlights.push([i]);
        }
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
};

const shellSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);

    const n = arr.length;

    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        for (let i = gap; i < n; i++) {
            let temp = arr[i];
            let j = i;

            steps.push([...arr]);
            highlights.push([i]);

            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                steps.push([...arr]);
                highlights.push([j, j - gap]);
                j -= gap;
            }

            if (arr[j] !== temp) {
                arr[j] = temp;
                steps.push([...arr]);
                highlights.push([j]);
            }
        }
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
};

const heapSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);

    const n = arr.length;

    const heapify = (size, i) => {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < size && arr[left] > arr[largest]) {
            largest = left;
            steps.push([...arr]);
            highlights.push([left, largest]);
        }
        
        if (right < size && arr[right] > arr[largest]) {
            largest = right;
            steps.push([...arr]);
            highlights.push([right, largest]);
        }

        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            steps.push([...arr]);
            highlights.push([i, largest]);
            heapify(size, largest);
        }
    };

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(n, i);
    }

    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        steps.push([...arr]);
        highlights.push([0, i]);

        heapify(i, 0);
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
};

const countingSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);

    const maxVal = Math.max(...arr);
    const minVal = Math.min(...arr);
    const range = maxVal - minVal + 1;
    const count = new Array(range).fill(0);
    const output = new Array(arr.length);

    for (let num of arr) {
        count[num - minVal]++;
    }

    for (let i = 1; i < range; i++) {
        count[i] += count[i - 1];
    }

    for (let i = arr.length - 1; i >= 0; i--) {
        const num = arr[i];
        output[count[num - minVal] - 1] = num;
        steps.push([...output.slice(0, i).concat(arr.slice(i))]);
        highlights.push([count[num - minVal] - 1]);
        count[num - minVal]--;
    }

    for (let i = 0; i < arr.length; i++) {
        arr[i] = output[i];
        steps.push([...arr]);
        highlights.push([i]);
    }

    return { steps, highlights };
};

const bucketSort = (indices, bucketSize = 5) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);

    if (arr.length === 0) return { steps, highlights };

    const minVal = Math.min(...arr);
    const maxVal = Math.max(...arr);

    const bucketCount = Math.floor((maxVal - minVal) / bucketSize) + 1;
    const buckets = Array.from({ length: bucketCount }, () => []);

    for (let num of arr) {
        const idx = Math.floor((num - minVal) / bucketSize);
        buckets[idx].push(num);
        steps.push([...arr]);
        highlights.push([]);
    }

    const insertionSort = (bucket) => {
        for (let i = 1; i < bucket.length; i++) {
            let key = bucket[i];
            let j = i - 1;
            while (j >= 0 && bucket[j] > key) {
                bucket[j + 1] = bucket[j];
                j--;
            }
            bucket[j + 1] = key;
        }
        return bucket;
    };

    let index = 0;
    for (let bucketIdx = 0; bucketIdx < bucketCount; bucketIdx++) {
        if (buckets[bucketIdx].length > 0) {
            const sortedBucket = insertionSort(buckets[bucketIdx]);
            for (let num of sortedBucket) {
                arr[index] = num;
                steps.push([...arr]);
                highlights.push([index]);
                index++;
            }
        }
    }

    return { steps, highlights };
};

const pigeonholeSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);

    const minVal = Math.min(...arr);
    const maxVal = Math.max(...arr);
    const size = maxVal - minVal + 1;
    const holes = new Array(size).fill(0);

    for (let num of arr) {
        holes[num - minVal]++;
        steps.push([...arr]);
        highlights.push([]);
    }

    let index = 0;
    for (let i = 0; i < size; i++) {
        while (holes[i] > 0) {
            arr[index] = i + minVal;
            steps.push([...arr]);
            highlights.push([index]);
            index++;
            holes[i]--;
        }
    }

    return { steps, highlights };
};

const gnomeSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];

    steps.push([...arr]);
    highlights.push([]);

    let pos = 0;
    while (pos < arr.length) {
        if (pos === 0 || arr[pos] >= arr[pos - 1]) {
            steps.push([...arr]);
            highlights.push([pos]);
            pos++;
        } else {
            [arr[pos], arr[pos - 1]] = [arr[pos - 1], arr[pos]];
            steps.push([...arr]);
            highlights.push([pos, pos - 1]);
            pos--;
        }
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
};

const bogoSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];

    steps.push([...arr]);
    highlights.push([]);

    const isSorted = (array) => {
        for (let i = 1; i < array.length; i++) {
            if (array[i] < array[i - 1]) return false;
        }
        return true;
    };

    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            if (i !== j) {
                [array[i], array[j]] = [array[j], array[i]];
                steps.push([...array]);
                highlights.push([i, j]);
            }
        }
    };

    let attempts = 0;
    const maxAttempts = 10000;
    
    while (!isSorted(arr) && attempts < maxAttempts) {
        shuffle(arr);
        attempts++;
    }

    if (attempts === maxAttempts) {
        console.warn("Bogo sort reached max attempts");
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
};

const cocktailSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];

    steps.push([...arr]);
    highlights.push([]);

    let start = 0;
    let end = arr.length - 1;
    let swapped = true;

    while (swapped) {
        swapped = false;

        for (let i = start; i < end; i++) {
            if (arr[i] > arr[i + 1]) {
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                steps.push([...arr]);
                highlights.push([i, i + 1]);
                swapped = true;
            } else {
                steps.push([...arr]);
                highlights.push([i, i + 1]);
            }
        }
        
        if (!swapped) break;
        
        swapped = false;
        end--;

        for (let i = end - 1; i >= start; i--) {
            if (arr[i] > arr[i + 1]) {
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                steps.push([...arr]);
                highlights.push([i, i + 1]);
                swapped = true;
            } else {
                steps.push([...arr]);
                highlights.push([i, i + 1]);
            }
        }
        start++;
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
};

const oddEvenSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];

    steps.push([...arr]);
    highlights.push([]);

    let sorted = false;
    const n = arr.length;

    while (!sorted) {
        sorted = true;

        for (let i = 1; i < n - 1; i += 2) {
            if (arr[i] > arr[i + 1]) {
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                steps.push([...arr]);
                highlights.push([i, i + 1]);
                sorted = false;
            } else {
                steps.push([...arr]);
                highlights.push([i, i + 1]);
            }
        }

        for (let i = 0; i < n - 1; i += 2) {
            if (arr[i] > arr[i + 1]) {
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                steps.push([...arr]);
                highlights.push([i, i + 1]);
                sorted = false;
            } else {
                steps.push([...arr]);
                highlights.push([i, i + 1]);
            }
        }
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
};

const waveSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];

    steps.push([...arr]);
    highlights.push([]);

    let gap = arr.length;
    let swapped = true;
    const shrinkFactor = 1.3;

    while (gap > 1 || swapped) {
        gap = Math.max(1, Math.floor(gap / shrinkFactor));
        swapped = false;
        
        for (let i = 0; i + gap < arr.length; i++) {
            if (arr[i] > arr[i + gap]) {
                [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
                steps.push([...arr]);
                highlights.push([i, i + gap]);
                swapped = true;
            } else {
                steps.push([...arr]);
                highlights.push([i, i + gap]);
            }
        }
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
};

const timSort = (indices, minRun = 32) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);

    const n = arr.length;

    const insertionSort = (left, right) => {
        for (let i = left + 1; i <= right; i++) {
            let temp = arr[i];
            let j = i - 1;
            
            steps.push([...arr]);
            highlights.push([i, j + 1]);
            
            while (j >= left && arr[j] > temp) {
                arr[j + 1] = arr[j];
                steps.push([...arr]);
                highlights.push([j, j + 1]);
                j--;
            }
            
            if (arr[j + 1] !== temp) {
                arr[j + 1] = temp;
                steps.push([...arr]);
                highlights.push([j + 1]);
            }
        }
    };

    const merge = (l, m, r) => {
        const leftArr = arr.slice(l, m + 1);
        const rightArr = arr.slice(m + 1, r + 1);

        let i = 0, j = 0, k = l;

        while (i < leftArr.length && j < rightArr.length) {
            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = rightArr[j];
                j++;
            }
            steps.push([...arr]);
            highlights.push([k]);
            k++;
        }

        while (i < leftArr.length) {
            arr[k] = leftArr[i];
            steps.push([...arr]);
            highlights.push([k]);
            i++;
            k++;
        }

        while (j < rightArr.length) {
            arr[k] = rightArr[j];
            steps.push([...arr]);
            highlights.push([k]);
            j++;
            k++;
        }
    };

    for (let i = 0; i < n; i += minRun) {
        insertionSort(i, Math.min(i + minRun - 1, n - 1));
    }

    for (let size = minRun; size < n; size *= 2) {
        for (let left = 0; left < n; left += 2 * size) {
            const mid = Math.min(left + size - 1, n - 1);
            const right = Math.min(left + 2 * size - 1, n - 1);
            if (mid < right) {
                merge(left, mid, right);
            }
        }
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
};


  const executeCustomAlgorithm = (indices) => {
    try {
      const func = new Function('arr', customAlgorithm);
      const result = func([...indices]);
      if (!Array.isArray(result) || result.length === 0) {
        throw new Error('必须返回步骤数组');
      }
      const steps = Array.isArray(result[0]) ? result : [result];
      const highlights = steps.map(() => []);
      return { steps, highlights };
    } catch (e) {
      alert('自定义算法错误: ' + e.message);
      return bubbleSort(indices);
    }
  };

  const startSort = () => {
    if (!isImageLoaded) {
      alert('请先上传图片');
      return;
    }
    
    stopFinalAudio();
    
    const imgSlices = createImageSlices();
    const audSlices = createAudioSlices();
    
    if (imgSlices.length === 0) {
      alert('图片切片创建失败');
      return;
    }
    
    setImageSlicesCache(imgSlices);
    setAudioSlicesCache(audSlices);
    
    const indices = Array.from({ length: sliceCount }, (_, i) => i);
    const shuffled = [...indices].sort(() => Math.random() - 0.5);
    
    setCurrentIndices(shuffled);
    
    if (audSlices.length === 0 && audioBuffer) {
      alert('音频切片创建失败');
      return;
    }
    
    let result;
    if (sortAlgorithm === 'bubble') {
      result = bubbleSort(shuffled);
    } else if (sortAlgorithm === 'quick') {
      result = quickSort(shuffled);
    } else if (sortAlgorithm === 'merge') {
      result = mergeSort(shuffled);
    } else if (sortAlgorithm === 'heap') {
      result = heapSort(shuffled);
    } else if (sortAlgorithm === 'selection') {
      result = selectionSort(shuffled);
    } else if (sortAlgorithm === 'gnome') {
      result = gnomeSort(shuffled);
    } else if (sortAlgorithm === 'cocktail') {
      result = cocktailSort(shuffled);
    } else if (sortAlgorithm === 'oddEven') {
      result = oddEvenSort(shuffled);
    } else if (sortAlgorithm === 'shell') {
      result = shellSort(shuffled);
    } else if (sortAlgorithm === 'wave') {
      result = waveSort(shuffled);
    } else if (sortAlgorithm === 'pigeonhole') {
      result = pigeonholeSort(shuffled);
    } else if (sortAlgorithm === 'bucket') {
      result = bucketSort(shuffled);
    } else if (sortAlgorithm === 'counting') {
      result = countingSort(shuffled);
    } else if (sortAlgorithm === 'tim') {
      result = timSort(shuffled);
    } else if (sortAlgorithm === 'bogo') {
      result = bogoSort(shuffled);
    } else if (sortAlgorithm === 'radix') {
      result = radixSort(shuffled);
    } else if (sortAlgorithm === 'insertion') {
      result = insertionSort(shuffled);
    } else {
      result = executeCustomAlgorithm(shuffled);
    }
    
    setSortStepsIndices(result.steps);
    setHighlightedPositions(result.highlights || []);
    setCurrentStep(0);
    setIsSorted(false);
    setIsPlaying(true);
    audioPlaybackRef.current.isPlaying = true;
  };

  useEffect(() => {
    if (!isPlaying || sortStepsIndices.length === 0) return;
    
    let delay;
    if (audioBuffer && audioSlicesCache.length > 0) {
      const audioSliceDuration = audioSlicesCache[0].duration * 1000;
      delay = Math.max(10, Math.min(audioSliceDuration * (201 - sortSpeed) / 200, 2000));
    } else {
      delay = Math.max(10, 2000 - (sortSpeed * 19));
    }
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= sortStepsIndices.length) {
          setIsPlaying(false);
          setIsSorted(true);
          audioPlaybackRef.current.isPlaying = false;
          if (audioBuffer) {
            setTimeout(() => playFinalAudio(), 500);
          }
          setHighlightedPositions([]);
          return prev;
        }
        return next;
      });
    }, delay);
    
    return () => clearInterval(interval);
  }, [isPlaying, sortStepsIndices, sortSpeed, audioBuffer, audioSlicesCache]);

  useEffect(() => {
    if (highlightedPositions.length > 0 && currentStep < highlightedPositions.length) {
      const currentStepIndices = highlightedPositions[currentStep];
      setCurrentIndices(sortStepsIndices[currentStep]);
      
      if (audioBuffer && audioPlaybackRef.current.isPlaying && audioSlicesCache.length > 0) {
        if (currentStep > 0) {
          const prevStepIndices = highlightedPositions[currentStep - 1];
          let changedPosition = -1;
          
          for (let i = 0; i < currentStepIndices.length; i++) {
            if (currentStepIndices[i] !== prevStepIndices[i]) {
              changedPosition = i;
              break;
            }
          }
          
          if (changedPosition >= 0) {
            const audioSlice = audioSlicesCache[currentStepIndices[changedPosition]];
            playAudioSlice(audioSlice);
          }
        } else if (audioSlicesCache.length > 0) {
          playAudioSlice(audioSlicesCache[currentStepIndices[0]]);
        }
      }
    }
  }, [currentStep, sortStepsIndices, highlightedPositions, audioBuffer, audioSlicesCache]);

  const renderSlices = () => {
    if (currentIndices.length === 0 || imageSlicesCache.length === 0) return null;
    
    const containerStyle = sliceDirection === 'vertical' 
      ? { display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' }
      : { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' };
    
    const currentHighlights = highlightedPositions[currentStep] || [];
    const scale = animationScale / 100;
    
    return (
      <div style={containerStyle} className="w-full h-full">
        {currentIndices.map((idx, position) => {
          const slice = imageSlicesCache[idx];
          if (!slice) return null;
          
          const isHighlighted = showHighlight && currentHighlights.includes(position);
          const width = sliceDirection === 'vertical' ? slice.displayWidth * scale : slice.displayWidth * scale;
          const height = sliceDirection === 'horizontal' ? slice.displayHeight * scale : slice.displayHeight * scale;
          
          return (
            <div 
              key={position} 
              style={{ 
                flexShrink: 0, 
                width: width + 'px', 
                height: height + 'px',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              <img 
                src={slice.dataUrl} 
                alt={'slice-' + idx} 
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  height: '100%', 
                  margin: 0, 
                  padding: 0, 
                  objectFit: 'cover',
                  border: !isHighlighted && showBorder ? `${borderWidth}px solid ${borderColor}` : 'none',
                  boxShadow: isHighlighted ? `0 0 0 1px ${highlightColor}` : 'none',
                }} 
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          排序算法可视化与音频化工具
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 hover:border-blue-500 transition">
            <label className="flex flex-col items-center cursor-pointer">
              <Upload className="w-12 h-12 text-blue-500 mb-2" />
              <span className="text-lg font-semibold text-gray-700 mb-2">上传图片</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {image && <img src={image} alt="preview" className="mt-4 max-h-40 rounded" />}
            </label>
          </div>
          
          <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 hover:border-purple-500 transition">
            <label className="flex flex-col items-center cursor-pointer">
              <Upload className="w-12 h-12 text-purple-500 mb-2" />
              <span className="text-lg font-semibold text-gray-700 mb-2">上传音频</span>
              <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
              {audio && <p className="mt-4 text-green-600 font-semibold">✓ 音频已加载</p>}
            </label>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">切片方向</label>
              <select value={sliceDirection} onChange={(e) => setSliceDirection(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                <option value="vertical">纵向切片</option>
                <option value="horizontal">横向切片</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">切片数量: {sliceCount}</label>
              <input type="range" min="5" max="400" value={sliceCount} onChange={(e) => setSliceCount(Number(e.target.value))} className="w-full" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">排序速度: {sortSpeed}</label>
              <input type="range" min="1" max="200" value={sortSpeed} onChange={(e) => setSortSpeed(Number(e.target.value))} className="w-full" />
              <p className="text-xs text-gray-500 mt-1">速度越高,切换越快</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">裁剪 X: {cropArea.x}%</label>
              <input type="range" min="0" max="50" value={cropArea.x} onChange={(e) => setCropArea({...cropArea, x: Number(e.target.value)})} className="w-full" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">裁剪宽度: {cropArea.width}%</label>
              <input type="range" min="50" max="100" value={cropArea.width} onChange={(e) => setCropArea({...cropArea, width: Number(e.target.value)})} className="w-full" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">音频开始: {audioRange.start.toFixed(2)}秒</label>
              <input type="range" min="0" max={audioBuffer ? audioBuffer.duration - 0.5 : 100} step="0.1" value={audioRange.start} onChange={(e) => { const start = Number(e.target.value); setAudioRange({ start, end: Math.min(start + (audioBuffer ? audioBuffer.duration / 2 : 10), audioBuffer?.duration || 100) }); }} className="w-full" />
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-md font-bold text-gray-800 mb-3">🎨 视觉效果设置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <input 
                    type="checkbox" 
                    checked={showHighlight} 
                    onChange={(e) => setShowHighlight(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  高亮正在排序的元素
                </label>
                {showHighlight && (
                  <div className="ml-6">
                    <label className="block text-xs text-gray-600 mb-1">高亮颜色</label>
                    <input 
                      type="color" 
                      value={highlightColor} 
                      onChange={(e) => setHighlightColor(e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <input 
                    type="checkbox" 
                    checked={showBorder} 
                    onChange={(e) => setShowBorder(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  显示切片边框
                </label>
                {showBorder && (
                  <div className="ml-6 space-y-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">边框颜色</label>
                      <input 
                        type="color" 
                        value={borderColor} 
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-full h-8 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">边框粗细: {borderWidth}px</label>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={borderWidth} 
                        onChange={(e) => setBorderWidth(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">动画缩放: {animationScale}%</label>
                <input 
                  type="range" 
                  min="25" 
                  max="200" 
                  value={animationScale} 
                  onChange={(e) => setAnimationScale(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">调整显示大小</p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">排序算法</label>
            <select value={sortAlgorithm} onChange={(e) => setSortAlgorithm(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
              <option value="wave">摆动排序</option>
              <option value="insertion">插入排序</option>
              <option value="gnome">地精排序</option>
              <option value="heap">堆排序</option>
              <option value="pigeonhole">鸽巢排序</option>
              <option value="merge">归并排序</option>
              <option value="bogo">猴子排序</option>
              <option value="oddEven">奇偶排序</option>
              <option value="counting">计数排序</option>
              <option value="radix">基数排序</option>
              <option value="cocktail">鸡尾酒排序</option>
              <option value="quick">快速排序</option>
              <option value="bubble">冒泡排序</option>
              <option value="tim">Tim排序</option>
              <option value="bucket">桶排序</option>
              <option value="shell">希尔排序</option>
              <option value="selection">选择排序</option>
              <option value="custom">自定义算法</option>
            </select>
          </div>
          
          {sortAlgorithm === 'custom' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">自定义算法代码</label>
              <textarea value={customAlgorithm} onChange={(e) => setCustomAlgorithm(e.target.value)} placeholder="const steps = [];\nconst array = [...arr];\nsteps.push([...array]);\n// 你的排序逻辑\nreturn steps;" className="w-full p-3 border border-gray-300 rounded font-mono text-sm h-32 focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
        </div>
        
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button onClick={startSort} disabled={!image || isPlaying} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition">
            <Play className="w-5 h-5" />
            开始排序
          </button>
          
          <button onClick={() => { setIsPlaying(!isPlaying); audioPlaybackRef.current.isPlaying = !isPlaying; }} disabled={sortStepsIndices.length === 0} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isPlaying ? '暂停' : '继续'}
          </button>
          
          <button onClick={playFinalAudio} disabled={!isSorted || !audioBuffer || isPlayingFinalAudio} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition">
            <Play className="w-5 h-5" />
            {isPlayingFinalAudio ? '播放中...' : '播放完整音频'}
          </button>
          
          <button onClick={() => { if (currentSourceRef.current) { try { currentSourceRef.current.stop(); } catch (e) {} } stopFinalAudio(); setCurrentIndices([]); setSortStepsIndices([]); setHighlightedPositions([]); setCurrentStep(0); setIsPlaying(false); setIsSorted(false); audioPlaybackRef.current.isPlaying = false; }} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 font-semibold shadow-lg transition">
            <RotateCw className="w-5 h-5" />
            重置
          </button>
        </div>
        
        {sortStepsIndices.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>步骤: {currentStep + 1} / {sortStepsIndices.length}</span>
              <span className={isSorted ? 'text-green-600 font-bold' : ''}>{isSorted ? '✓ 排序完成!' : '⏳ 排序中...'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300" style={{ width: ((currentStep + 1) / sortStepsIndices.length) * 100 + '%' }} />
            </div>
          </div>
        )}
        
        <div ref={containerRef} className="bg-gray-100 rounded-lg p-6 flex justify-center items-center min-h-[400px]">
          {currentIndices.length > 0 ? (
            <div className="max-w-full max-h-[600px] overflow-auto">
              {renderSlices()}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-20">
              <Scissors className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">上传图片和音频,点击开始排序查看效果</p>
              <p className="text-sm mt-2">图片会被切片并打乱,通过排序算法恢复原状</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SortVisualizer;