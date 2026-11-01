package com.facebook.react.common.assets

import android.graphics.Typeface

class ReactFontManager private constructor() {
  private val fonts = mutableMapOf<String, Typeface>()
  fun addCustomFont(family: String, typeface: Typeface) { fonts[family] = typeface }
  fun getTypeface(family: String, style: Int, assets: Any?): Typeface =
    fonts[family] ?: Typeface.MONOSPACE

  companion object {
    private val instance = ReactFontManager()
    fun getInstance(): ReactFontManager = instance
  }
}
