# 带声音排序可视化 / Sort Visualization with sound

这是一个可以播放音频的排序可视化网站，支持多种排序算法和自定义算法。

This is a website for visualizing sorting algorithms with audio support. It supports various sorting algorithms, including custom ones.

## 使用方法 / Guide to use

将图片和音频上传好后，选择切片数量和排序算法，开始排序即可。

After uploading the image and the audio, select the amount of slices and the sorting algorithm, and press the start key.

## 自定义排序算法 / Custom sorting algorithm

如果要使用自己的排序算法那么请选择“自定义排序”按钮并使用 JavaScript 写如下格式的函数：

If you want to use you custom sorting algorithm, select "custom sorting" and write a JavaScript function of this format:
```js
(arr) -> result
```
其中 `result` 是每一步后的数组。这个模式下暂时不支持高亮元素。

Where `result` is the array after each step. Currently this mode doesn't support highlighting elements.

## 自定义数组打乱方式 / Custom shuffle

如果要实现自定义数组打乱那么请选择“自定义打乱”按钮并使用 JavaScript 写如下格式的函数：

If you want to use you custom shuffling algorithm, select "custom shuffle" and write a JavaScript function of this format:
```js
(n) -> indices
```
其中 `indices` 是打乱后的排列，应当恰好覆盖 $[0,n-1]$ 的每个元素一次。

Where `indices` is the shuffled array, and it should cover every element from $[0,n-1]$ exactly once.