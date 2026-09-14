<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['year', 'title', 'description', 'order'])]
class Milestone extends Model
{
    //
}
