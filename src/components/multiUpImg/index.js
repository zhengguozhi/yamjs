/*
 * @Author: xuxueliang
 * @Date: 2020-02-18 15:13:32
 * @LastEditors: xuxueliang
 * @LastEditTime: 2020-02-20 14:02:06
 */
import Yam, { Component } from 'yamjs'
import UpImg from '../upfile/upimg'
@Component({
  tagName: 'mulit-upimg',
  style: require('./index.stylus'),
  props: ['serverurl', 'title', 'type', 'suffix', 'width', 'height']
})
class App extends Yam {
  $data () {
    return {
      // your data
      title: '213',
      imgs: []
    }
  }
  uploadok (imgObj) {
    console.log(imgObj)
    this.imgs.push(imgObj.picUrl)
    console.log(this.__isWillupdate)
    this.title = imgObj.picUrl
    // this.update()
  }
  $beforeUpdate () {
    console.log(this)
  }
  $mounted () {
    console.log('===============multi-upimg')
  }
  render () {
    return <div>
      { this.width }
      { this.title }
      { this.imgs.map((v, i) => (<div key={ i } className='img-show' style={ { 'width': this.width + 'px', height: this.height + 'px', backgroundImage: 'url(' + v + ')' } }>

      </div>
      )) }
      <UpImg></UpImg>
      <up-img className='up-img' style={ { 'width': this.width + 'px', height: this.height + 'px' } } uploadok={ this.uploadok.bind(this) } title="上传图片"></up-img>
    </div >
  }
}
export default App
