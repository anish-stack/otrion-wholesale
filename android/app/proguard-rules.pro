# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.proguard.annotations.DoNotStrip

# OkHttp (networking)
-keep class okhttp3.** { *; }
-dontwarn okhttp3.**

# Firebase (if used)
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**



# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep annotated methods
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip <methods>;
}

# Keep style resources
-keepresourcexmlres style
-keepclassmembers class * {
    @androidx.annotation.StyleRes <fields>;
}