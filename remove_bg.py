from PIL import Image

def remove_white_background(img_path):
    img = Image.open(img_path)
    img = img.convert("RGBA")
    
    data = img.getdata()
    new_data = []
    
    # White tolerance (240 out of 255)
    tolerance = 240
    
    for item in data:
        # Check if pixel is white or near-white
        if item[0] >= tolerance and item[1] >= tolerance and item[2] >= tolerance:
            # Change to transparent
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(img_path, "PNG")
    print("Background removed successfully.")

if __name__ == "__main__":
    remove_white_background("web/public/verified-badge.png")
