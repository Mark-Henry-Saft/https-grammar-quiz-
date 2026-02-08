
from PIL import Image
import os

# Configuration
INPUT_IMAGE = r"C:\Users\Mark Henry Saft\.gemini\antigravity\brain\b34ab5ad-e809-4543-a471-d749b5eaac2e\media__1770522239922.png"
OUTPUT_DIR = r"c:\Users\Mark Henry Saft\.gemini\antigravity\scratch\grammar-quiz\src\assets\images"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def split_image():
    print(f"Loading {INPUT_IMAGE}...")
    try:
        img = Image.open(INPUT_IMAGE).convert("RGBA")
    except Exception as e:
        print(f"Error loading image: {e}")
        return

    width, height = img.size
    print(f"Image size: {width}x{height}")
    
    # Remove background (simple threshold)
    datas = img.getdata()
    new_data = []
    threshold = 40 # Increased slightly
    
    # Calculate column sums (brightness) to find gaps
    col_sums = [0] * width
    
    for i, item in enumerate(datas):
        x = i % width
        # pixel brightness
        brightness = sum(item[:3])
        if brightness > threshold:
            col_sums[x] += brightness
        else:
            # Make dark pixels transparent
            new_data.append((0, 0, 0, 0))
            continue
        new_data.append(item)
    
    img.putdata(new_data)
    
    # Analyze col_sums to find split points
    # We expect 3 distinct peaks.
    # We want to find the 2 deepest valleys between the peaks.
    
    # Smooth the signal slightly
    smoothed = []
    window = 10
    for i in range(width):
        start = max(0, i - window)
        end = min(width, i + window)
        smoothed.append(sum(col_sums[start:end]) / (end - start))
        
    # Find valley points
    # We assume the image is roughly divided into thirds.
    # Look for min in the 1/3 and 2/3 regions.
    
    split1_search_start = width // 3 - 50
    split1_search_end = width // 3 + 50
    
    split2_search_start = (width * 2) // 3 - 50
    split2_search_end = (width * 2) // 3 + 50
    
    split1 = min(range(split1_search_start, split1_search_end), key=lambda i: smoothed[i])
    split2 = min(range(split2_search_start, split2_search_end), key=lambda i: smoothed[i])
    
    print(f"Split points found at x={split1} and x={split2}")
    
    crops = [
        img.crop((0, 0, split1, height)),
        img.crop((split1, 0, split2, height)),
        img.crop((split2, 0, width, height))
    ]
    
    names = ["grammar_police.png", "sarcasm_mode.png", "fail_stamp.png"]
    
    for i, crop in enumerate(crops):
        # Trim whitespace
        bbox = crop.getbbox()
        if bbox:
            crop = crop.crop(bbox)
            path_out = os.path.join(OUTPUT_DIR, names[i])
            crop.save(path_out)
            print(f"Saved {path_out} (Size: {crop.size})")
        else:
            print(f"Warning: Crop {i} was empty.")

split_image()
